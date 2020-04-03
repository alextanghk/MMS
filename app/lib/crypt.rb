module Crypt
    class << self
      def encrypt(value)
        crypt(:encrypt, value)
      end
  
      def decrypt(value)
        crypt(:decrypt, value)
      end
  
      def encryption_key
        ENV["SECRET_KEY"]
      end
  
      ALGO = 'AES-256-ECB'.freeze
      def crypt(cipher_method, value)
        cipher = OpenSSL::Cipher.new(ALGO)
        cipher.send(cipher_method)
        cipher.pkcs5_keyivgen(encryption_key)
        result = cipher.update(value)
        result << cipher.final
      end
    end
  end