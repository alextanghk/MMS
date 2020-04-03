require 'openssl'
require 'base64'

class AccessRight < ApplicationRecord

    has_many :group_accesses
    has_many :user_groups, through: :group_accesses

    scope :active, -> { where(is_deleted: false) }

    validates :code, presence:  { message: "field_error_required"}, uniqueness:  { message: "field_error_unique"}
    validates :displayname, presence:  { message: "field_error_required"}
    validates :function, presence:  { message: "field_error_required"}
    validates :category, presence:  { message: "field_error_required"}
    
end
