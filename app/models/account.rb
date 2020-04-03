class Account < ApplicationRecord
    has_many :transactions

    scope :active, -> { where(is_deleted: false) }

    validates :bank, presence: { message: "field_error_required"}, uniqueness:  { message: "field_error_unique"}
    validates :is_default, uniqueness: { message: "field_error_single_default_allow", if: :is_default}

    def can_be_created_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_ACCOUNT"])
    end

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_ACCOUNT"])
    end

    def can_be_deleted_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_ACCOUNT"])
    end
end
