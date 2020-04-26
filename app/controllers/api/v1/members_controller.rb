class Api::V1::MembersController < Api::V1::ApplicationController
    before_action :user_authorize_request
    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_MEMBER")

        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25

        items = Member.active

        if query[:keywords].present?
            items = items.where("zh_surname LIKE ? OR en_surname LIKE ? OR zh_first_name LIKE ? OR en_first_name LIKE ?","%#{query[:keywords]}%", "%#{query[:keywords]}%","%#{query[:keywords]}%", "%#{query[:keywords]}%")
        end
        items = items.order(query[:order] => query[:sort])
        render json: {
            message: "success",
            error: nil,
            count: items.count,
            data: items.paginate(page,size).map  { |row|
                item = ReturnFormat(row)
                item
            }
        }
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def get
        raise SecurityTransgression unless @current_user.can_do?("GET_MEMBER")
        id = params[:item_id]
        item = Member.active.find(id.to_i)
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def create
        form = params.permit(
                :zh_surname, :en_surname, :zh_first_name, :en_first_name,
                :hkid, :email, :gender, :mobile,
                :yob, :dob, :home_phone, :home_address,
                :comnpany, :department, :job_title,
                :employment_terms, :office_address, :office_phone, :profile, :remark,
                :emergency_contact, :emergency_relation ,:emergency_number,
                :subscription, :sent_group_invite, :is_actived,
                :password, :password_confirmation
            )
        item = Member.new(form)
        raise SecurityTransgression unless @current_user.can_create?(item)
        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end
        
        item.save
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update
        id = params[:item_id]
        item = Member.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)
        form = params.permit(
                :zh_surname, :en_surname, :zh_first_name, :en_first_name,
                :hkid, :email, :gender, :mobile,
                :yob, :dob, :home_phone, :home_address,
                :comnpany, :department, :job_title,
                :employment_terms, :office_address, :office_phone, :profile, :remark,
                :emergency_contact, :emergency_relation ,:emergency_number,
                :subscription, :sent_group_invite, :is_actived,
                :password, :password_confirmation
            )

        item.assign_attributes(form)
        setting = params.permit(:delete_profile)
        isDeleteFile = setting[:delete_profile].to_bool

        if isDeleteFile
            item.profile.clear
        end

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        item.save

        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }

    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def delete
        id = params[:item_id]
        item = Member.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_delete?(item)

        item.is_deleted = true
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def ReturnFormat(item)
        
        result = item.attributes.except(
            'is_deleted','password_digest','profile_file_name','profile_content_type','profile_file_size','uuid'
        )

        if item.profile_file_name.nil?
            result[:profile] = nil
        else
            result[:profile] = {
                :original => item.profile.url(:original),
                :thumb => item.profile.url(:thumb)
            }
        end
        result
    end
end
