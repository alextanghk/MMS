require 'openssl'
require 'base64'
class Member < ApplicationRecord
    has_secure_password

    has_many :registrations

    # Encrypt all sensitive infomration
    serialize :zh_surname, EncryptedCoder.new
    serialize :en_surname, EncryptedCoder.new
    serialize :zh_first_name, EncryptedCoder.new
    serialize :en_first_name, EncryptedCoder.new
    serialize :mobile, EncryptedCoder.new
    serialize :home_phone, EncryptedCoder.new
    serialize :home_address, EncryptedCoder.new
    serialize :office_address, EncryptedCoder.new
    serialize :office_phone, EncryptedCoder.new
    serialize :hkid, EncryptedCoder.new

    scope :active, -> { where(is_deleted: false) }

    validates :member_ref, uniqueness:  { message: "field_error_unique"}, allow_nil: true

    # Personal information
    validates :email, presence:  { message: "field_error_required"}, format: { with: URI::MailTo::EMAIL_REGEXP } 
    validates :email, uniqueness:  { message: "field_error_unique"}
    validates :zh_first_name, presence: { message: "field_error_required"}
    validates :zh_surname, presence: { message: "field_error_required"}
    validates :en_first_name, presence: { message: "field_error_required"}
    validates :en_surname, presence: { message: "field_error_required"}
    validates :hkid, presence: { message: "field_error_required"}
    validates :yob, presence: { message: "field_error_required"}
    validates :dob, presence: { message: "field_error_required"}
    validates :home_address, presence: { message: "field_error_required"}
    validates :mobile, presence: { message: "field_error_required"}

    # Job information
    validates :comnpany, presence: { message: "field_error_required"}
    validates :job_title, presence: { message: "field_error_required"}
    validates :office_address, presence: { message: "field_error_required"}
    validates :employment_terms, presence: { message: "field_error_required"}

    # For System
    validates :password, confirmation: { message: "field_error_confirmation"}, unless: Proc.new { |a| a.password.blank? }
    validates :password_confirmation, presence: { message: "field_error_required"}, unless: Proc.new { |a| a.password.blank? }
    validates :password, presence: { message: "field_error_required"}, on: :create
    validates :password, length: { minimum: 8, message: "field_error_length" }, unless: Proc.new { |a| a.password.blank? }

    Paperclip.interpolates :uuid do |attachment, style|
        attachment.instance.uuid
    end

    has_attached_file :profile, 
        styles: { thumb: "100x100>" }, 
        :storage => :fog,
        fog_credentials: {
            google_storage_access_key_id: ''ENV.fetch('GOOGLE_STORAGE_ID')'',
            google_storage_secret_access_key: ENV.fetch('GOOGLE_STORAGE_SECRET'),
            provider: 'Google' },
        fog_directory: ENV.fetch('GOOGLE_STORAGE_SECRET'),
        :path => "members/:uuid/:style/:filename", # :path => ":rails_root/public/uploads/members/:uuid/:style/:filename", 
        :url => ENV["BASE_URL"]+"/uploads/members/:uuid/:style/:filename"
    
    validates_attachment_content_type :profile, content_type: /\Aimage\/.*\z/

    validates :subscription, acceptance: { message: "field_error_true_only"}

    after_create :gen_member_ref

    before_create do
        self.uuid = loop do
            random_token = SecureRandom.urlsafe_base64(9, false)
            break random_token unless self.class.exists?(uuid: random_token)
        end
        
        # Membership ref. format
    end

    def can_be_created_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_MEMBER"])
    end

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_MEMBER"])
    end

    def can_be_deleted_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_MEMBER"])
    end

    def gen_member_ref
        self.update_attributes!(member_ref: self.id+191000)
    end
    
end
