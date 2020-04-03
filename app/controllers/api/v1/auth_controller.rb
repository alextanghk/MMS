class Api::V1::AuthController < Api::V1::ApplicationController
    before_action :user_authorize_request, except: [:login]

    def index 
        token = session[:user_token]
        usertoken = @current_user.user_tokens.find_by(token: token)
        
        render json: {
            message: "success",
            error: nil,
            data: nil
        }

        rescue => e
            render status:500, json: {
                message: "system error",
                error: e.message,
                data: nil
            }
    end

    def login

        p request.headers["Cookie"]

        up = params.permit(:username,:password)

        if !User.active.exists?(user_name: up[:username])
            render json: { message: "user_not_found", error: "user_not_found" }, status: :not_found
            return
        end

        user = User.active.find_by(user_name: up[:username])

        user = user.try(:authenticate, up[:password]);
        if !user
            render status:401, json: {
                message: "username_password_incorrect",
                error: "username_password_incorrect",
                data: nil
            }
            return
        end

        token = JsonWebToken.encode({
            user_id: user.id,
            zh_name: user.zh_name,
            en_name: user.en_name,
            login_at: DateTime.now
        })

        usertoken = user.user_tokens.create({
            token: token,
            auth_type: 'password',
            login_ip:request.remote_ip,
        })

        if !usertoken.valid?
            render status:401, json: {
                message: "Access Denied",
                error: usertoken.errors.messages,
                data: nil
            }
            return
        end

        session[:user_token] = usertoken.token

        render json: {
            message: "success",
            error: nil,
            data: {
                exp_date: usertoken.exp_date,
                zh_name: user.zh_name,
                en_name: user.en_name,
                access_rights: user.user_group.access_rights.map{|row|
                    row.code
                }
            }
        }

        rescue => e
            render status:500, json: {
                message: "system error",
                error: e.message,
                data: nil
            }
    end

    def logout
        token = session[:user_token]
        usertoken = @current_user.user_tokens.find_by(token: token)
        usertoken.destroy
        session.delete(:user_token)

        render json: {
            message: "success",
            error: nil,
            data: nil
        }

        rescue => e
            render status:500, json: {
                message: "system error",
                error: e.message,
                data: nil
            }
    end
end
