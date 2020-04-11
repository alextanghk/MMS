require 'openssl'
require 'base64'

class Api::V1::RegistrationsController < Api::V1::ApplicationController
    before_action :user_authorize_request
    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_REGISTRATION")

        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25

        items = Registration.active

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
        raise SecurityTransgression unless @current_user.can_do?("GET_REGISTRATION")
        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        
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

    def apply
        form = params.permit(
            :zh_surname, :en_surname, :zh_first_name, :en_first_name, :hkid,
            :email, :gender, :mobile,
            :yob, :dob, :home_phone, :home_address,
            :declare, :agreement,
            :comnpany, :department, :job_title,
            :employment_terms, :office_address, :office_phone,
            :proof
        )
        item = Registration.new(form)
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
        p e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def create
        form = params.permit(
            :zh_surname, :en_surname, :zh_first_name, :en_first_name, :hkid,
                :email, :gender, :mobile,
                :yob, :dob, :home_phone, :home_address,
                :declare, :agreement,
                :comnpany, :department, :job_title,
                :employment_terms, :office_address, :office_phone,
                :proof, :remark
            )
        audit = params.permit(
            :receipt_no, :payment_method, :paid, :paid_at, :sent_confirmation,
            :sent_payment_note, :sent_receipt, :sent_group_invite
        )
        item = Registration.new(form)
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

        item.registration_audit.assign_attributes(audit)
        if !item.registration_audit.valid?
            render status:500, json: {
                message: "invalid",
                error: item.registration_audit.errors.messages,
                data: nil
            }
            return
        end

        item.registration_audit.save
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        p e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update
        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)

        if item.status == "Completed"
            raise SecurityTransgression unless @current_user.can_do?("UPDATE_REGISTRATION_AFTER_APPROVED")
        end

        form = params.permit(
                :zh_name, :en_name, :hkid,
                :email, :gender, :mobile,
                :yob, :dob, :home_phone, :home_address,
                :comnpany, :department, :job_title,
                :employment_terms, :office_address, :office_phone, :proof, :remark
            )
        audit = params.permit(
            :receipt_no, :payment_method, :paid, :paid_at, :sent_confirmation,
            :sent_payment_note, :sent_receipt, :sent_group_invite
        )
        item.assign_attributes(form)

        setting = params.permit(:delete_proof)
        isDeleteProof = setting[:delete_proof].to_bool

        if isDeleteProof
            item.proof.clear
        end

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        item.registration_audit.assign_attributes(audit)
        if !item.registration_audit.valid?
            render status:500, json: {
                message: "invalid",
                error: item.registration_audit.errors.messages,
                data: nil
            }
            return
        end

        item.registration_audit.save
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
        item = Registration.active.find(id.to_i)
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

    def withdraw
        raise SecurityTransgression unless @current_user.can_do?("WITHDRAW_REGISTRATION")

        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        
        if item.status == "Completed"
            raise SecurityTransgression unless @current_user.can_do?("UPDATE_REGISTRATION_AFTER_APPROVED")
        end

        item.status = "Withdraw"
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

    def cancel
        raise SecurityTransgression unless @current_user.can_do?("CANCEL_REGISTRATION")

        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        
        if item.status == "Completed"
            raise SecurityTransgression unless @current_user.can_do?("UPDATE_REGISTRATION_AFTER_APPROVED")
        end

        item.status = "Cancelled"
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

    def complete
        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_do?("APPROVE_REGISTRATION")

        if item.status != "New"
            render json: { message: "registration_"+item.status.downcase , error: "registration_"+item.status.downcase }, status: :internal_server_error
            return
        end

        if !item.registration_audit.paid
            render json: { message: "not_paid_yet" , error: "not_paid_yet" }, status: :internal_server_error
            return
        end
        
        random_token = SecureRandom.urlsafe_base64(8, false)
        member = Member.new({
            zh_surname: item.zh_surname,
            en_surname: item.en_surname,
            zh_first_name: item.zh_first_name,
            en_first_name: item.en_first_name,
            email: item.email,
            mobile: item.mobile,
            home_phone: item.home_phone,
            home_address: item.home_address,
            hkid: item.hkid,
            yob: item.yob,
            dob: item.dob,
            gender: item.gender,
            comnpany: item.comnpany,
            department: item.department,
            job_title: item.job_title,
            employment_terms: item.employment_terms,
            office_address: item.office_address,
            office_phone: item.office_phone,
            password: random_token,
            is_actived: true,
            password_confirmation: random_token
        })
        if !member.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end
        member.save

        item.member = member
        item.status = "Completed"
        if !item.valid?
            member.destroy
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
            data: ReturnMemberFormat(member)
        }
        

    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    private 
    
    def ReturnFormat(item)
        
        result = item.attributes.except(
            'is_deleted','member_id','proof_file_name','proof_content_type','proof_file_size','uuid'
        )
        if item.proof_file_name.nil?
            result[:proof] = nil
        else
            result[:proof] = {
                :original => item.proof.url(:original),
                :thumb => item.proof.url(:thumb)
            }
        end
        
        result[:member] = item.member
        result[:audit] = item.registration_audit.attributes.except(
            'id','registration_id','is_deleted'
        )
        result
    end

    def ReturnMemberFormat(item)
        
        result = item.attributes.except(
            'is_deleted','member_id','password_digest','profile_file_name','profile_content_type','profile_file_size','uuid'
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
