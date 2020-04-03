class UserToken < ApplicationRecord
  belongs_to :user

  scope :active, -> { where("exp_date > ?",DateTime.now) }

  before_create do
    self.exp_date = DateTime.now + 1.month
  end
end
