require 'openssl'
require 'base64'
class Registration < ApplicationRecord
  belongs_to :member, optional: true

  has_one :registration_audit

  scope :active, -> { where(is_deleted: false) }

  # Encrypt all sensitive infomration
  serialize :zh_surname, EncryptedCoder.new
  serialize :en_surname, EncryptedCoder.new
  serialize :zh_first_name, EncryptedCoder.new
  serialize :en_first_name, EncryptedCoder.new
  serialize :mobile, EncryptedCoder.new
  serialize :home_phone, EncryptedCoder.new
  serialize :home_address, EncryptedCoder.new
  serialize :hkid, EncryptedCoder.new

  # Personal information
  validates :email, presence:  { message: "field_error_required"}, format: { with: URI::MailTo::EMAIL_REGEXP } 
  validates :email, uniqueness:  { message: "field_error_unique"}
  validates :zh_surname, presence: { message: "field_error_required"}
  validates :en_surname, presence: { message: "field_error_required"}
  validates :zh_first_name, presence: { message: "field_error_required"}
  validates :en_first_name, presence: { message: "field_error_required"}
  validates :hkid, presence: { message: "field_error_required"}
  validates :yob, numericality: { only_integer: true, greater_than: 1900, message:"field_error_invalid" }

  validates :dob, presence: { message: "field_error_required"}, format: { with: /\d{4}-\d{2}-\d{2}/, message: "field_error_invalid" } 
  validates :home_address, presence: { message: "field_error_required"}
  validates :mobile, presence: { message: "field_error_required"}
  validates :gender, presence: { message: "field_error_required"}

  validates :declare, presence: { message: "field_error_required"}
  validates :declare, acceptance: { message: "field_error_true_only"}

  validates :agreement, presence: { message: "field_error_required"}
  validates :agreement, acceptance: { message: "field_error_true_only"}

  # System

  # Status:
  # New - New application
  # Pending - Pending to handle
  # Withdraw - Withdraw by user / admin
  # Approved - Validated and waiting for payment
  # Paid - Paid and waiting for Receipt
  # Completed - All step done
  # Cancelled - Cancelled by Admin / applier
  validates :status, presence: { message: "field_error_required"}
  validates :status, inclusion: { in:["New","Completed","Withdraw","Cancelled"], message: "field_error_value_invalid"}

  after_create do
    self.registration_audit = RegistrationAudit.create
  end

  def can_be_created_by?(user)
    return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_REGISTRATION"])
  end

  def can_be_updated_by?(user)
      return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_REGISTRATION"])
  end

  def can_be_approve_by?(user)
    return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","APPROVE_REGISTRATION"])
  end

  def can_be_cancel_by?(user)
    return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","CANCEL_REGISTRATION"])
  end

  def can_be_withdraw_by?(user)
    return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","WITHDRAW_REGISTRATION"])
  end

  def can_be_deleted_by?(user)
      return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_REGISTRATION"])
  end


  # Job Part

  serialize :office_address, EncryptedCoder.new
  serialize :office_phone, EncryptedCoder.new

  # Job information
  validates :comnpany, presence: { message: "field_error_required"}
  validates :job_title, presence: { message: "field_error_required"}
  validates :office_address, presence: { message: "field_error_required"}
  validates :employment_terms, presence: { message: "field_error_required"}

  Paperclip.interpolates :uuid do |attachment, style|
    attachment.instance.uuid
  end

  has_attached_file :proof, 
    styles: { thumb: "100x100>" }, 
    :storage => :fog,
    fog_credentials: {
        google_storage_access_key_id: ''ENV.fetch('GOOGLE_STORAGE_ID')'',
        google_storage_secret_access_key: ENV.fetch('GOOGLE_STORAGE_SECRET'),
        provider: 'Google' },
    fog_directory: ENV.fetch('GOOGLE_STORAGE_SECRET'),
    :path => "registry/:uuid/:style/:filename", # :path => ":rails_root/public/uploads/registry/:uuid/:style/:filename", 
    :url => ENV["BASE_URL"]+"/uploads/registry/:uuid/:style/:filename"
  
  validates_attachment_content_type :proof, content_type: /\Aimage\/.*\z/

  before_create do
    self.uuid = loop do
        random_token = SecureRandom.urlsafe_base64(10, false)
        break random_token unless self.class.exists?(uuid: random_token)
    end
  end
end
