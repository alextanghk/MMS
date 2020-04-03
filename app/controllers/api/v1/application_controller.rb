class SecurityTransgression < StandardError
  def message
    "user_access_deined"
  end
end
class Api::V1::ApplicationController < ApplicationController 
  include ActionController::Cookies

  rescue_from SecurityTransgression do |e|
    render json: { message: e.message, error: e.message }, status: :unauthorized
  end
  
  
  def user_authorize_request

    token = session[:user_token]
    if token.nil?
        render json: { message: "token_not_found", error: "token_not_found" }, status: :unauthorized
        return
    end
    if !UserToken.active.exists?(token: token)
      render json: { message: "token_expired", error: "token_expired" }, status: :unauthorized
      return
    end
    begin
      @decoded = JsonWebToken.decode(token)
      
      @current_user = User.active.find(@decoded[:user_id])
      
    rescue ActiveRecord::RecordNotFound => e
      render json: { message: e.message, error: e.message }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { message: e.message, error: e.message }, status: :unauthorized
    end
  end
end
