class SecurityTransgression < StandardError
    def message
      "user_access_deined"
    end
  end