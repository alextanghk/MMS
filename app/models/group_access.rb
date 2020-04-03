class GroupAccess < ApplicationRecord
  belongs_to :user_group
  belongs_to :access_right
end
