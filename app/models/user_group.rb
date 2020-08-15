require 'openssl'
require 'base64'
class UserGroup < ApplicationRecord
    has_paper_trail
    
    has_many :group_accesses
    has_many :access_rights, through: :group_accesses
    
    scope :active, -> { where(is_deleted: false) }

    validates :name, presence:  { message: "field_error_required"}
    validates :name, uniqueness:  { scope: :is_deleted, message: "field_error_unique"}, :if =>  Proc.new { |a| !a.is_deleted }

    def can_be_created_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_MEMBER"])
    end

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_MEMBER"])
    end

    def can_be_deleted_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_MEMBER"])
    end
end
