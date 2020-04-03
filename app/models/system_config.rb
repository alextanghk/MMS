class SystemConfig < ApplicationRecord
    
    scope :active, -> { where(is_deleted: false) }

    validates :code, presence: { message: "field_error_required"}, uniqueness:  { message: "field_error_unique"}
    validates :display_name, presence: { message: "field_error_required"}, uniqueness:  { message: "field_error_unique"}

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_SYS_CONFIG"])
    end

end
