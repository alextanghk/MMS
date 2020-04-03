class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  class << self
    def paginate(page = 1, per_page = 25)
        page = page.to_i
        per_page = per_page.to_i

        offset = (page - 1) * per_page
        limit(per_page).offset(offset)
    end
  end
end
