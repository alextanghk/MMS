class NilClass
    def self.to_bool
        false
    end
    def to_bool
        false
    end
end
  
class String
    def to_bool
        return true if self.downcase == "true"
        return false if self.downcase == "false"
        return nil
    end
end