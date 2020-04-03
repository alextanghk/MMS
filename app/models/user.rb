require 'openssl'
require 'base64'
class User < ApplicationRecord
    has_many :user_tokens
    belongs_to :user_group
    
    has_secure_password

    # Encrypt all sensitive infomration
    serialize :mobile, EncryptedCoder.new

    scope :active, -> { where(is_deleted: false) }

    validates :email, presence:  { message: "field_error_required"}, format: { with: URI::MailTo::EMAIL_REGEXP } 
    validates :email, uniqueness:  { message: "field_error_unique"}
    validates :zh_name, presence: { message: "field_error_required"}
    validates :en_name, presence: { message: "field_error_required"}
    validates :user_name, presence: { message: "field_error_required"}, uniqueness:  { message: "field_error_unique"}

    validates :password, confirmation: { message: "field_error_confirmation"}, unless: Proc.new { |a| a.password.blank? }
    validates :password_confirmation, presence: { message: "field_error_required"}, unless: Proc.new { |a| a.password.blank? }
    validates :password, presence: { message: "field_error_required"}, on: :create
    validates :password, length: { minimum: 8, message: "field_error_length" }, unless: Proc.new { |a| a.password.blank? }

    def can_do?(code)
        return true if self.user_group.access_rights.exists?(code: ["ALL_REQUEST",code])
    end

    def can_create?(resource)
        resource.can_be_created_by?(self)
    end
    
    def can_update?(resource)
        resource.can_be_updated_by?(self)
    end

    def can_delete?(resource)
        resource.can_be_deleted_by?(self)
    end

    # Access Checking
    def can_be_created_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_USER"])
    end

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_USER"])
    end

    def can_be_deleted_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_USER"])
    end
end
