require 'openssl'
require 'base64'

class Api::V1::RegistrationsController < Api::V1::ApplicationController
    before_action :user_authorize_request, :set_paper_trail_whodunnit
    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_REGISTRATION")

        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25

        items = Registration.active

        if query[:keywords].present?
            items = items.where("zh_surname ILIKE :keywords OR en_surname ILIKE :keywords OR zh_first_name ILIKE :keywords OR en_first_name ILIKE :keywords OR email ILIKE :keywords",keywords: "%#{query[:keywords]}%")
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
    rescue SecurityTransgression => e
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
    rescue SecurityTransgression => e
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
    rescue SecurityTransgression => e
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
                :proof, :remark,:receipt_no, :payment_method, :paid, :paid_at, 
                :sent_confirmation,
                :sent_payment_note, :sent_receipt, :sent_group_invite
            )
        
        item = Registration.new(form)
        item.created_by = @current_user.id
        item.updated_by = @current_user.id
        mdata = params.permit(
            :member_ref
        )

        if mdata[:member_ref].present? && Member.exists?(member_ref: mdata[:member_ref]) 
            item.member = Member.find_by(member_ref: mdata[:member_ref])
        end


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
    rescue SecurityTransgression => e
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
                :employment_terms, :office_address, :office_phone, :proof, :remark,
                :receipt_no, :payment_method, :paid, :paid_at, :sent_confirmation,
                :sent_payment_note, :sent_receipt, :sent_group_invite
            )
        item.assign_attributes(form)

        setting = params.permit(:delete_proof)
        isDeleteProof = setting[:delete_proof].to_bool

        if isDeleteProof
            item.proof.clear
        end

        mdata = params.permit(
            :member_ref
        )
        if Member.exists?(member_ref: mdata[:member_ref]) 
            item.member = Member.find_by(member_ref: mdata[:member_ref])
        end
        
        item.updated_by = @current_user.id
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
    rescue SecurityTransgression => e
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
    rescue SecurityTransgression => e
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
        else
            render json: { message: "can_only_withdraw_completed_record" , error: "can_only_withdraw_completed_record" }, status: :internal_server_error
        end

        item.status = "Withdraw"

        fee = SystemConfig.find_by(code: "MEMBERSHIP_FEE")

        tran = Transaction.new({
            :account => Account.find_by(:is_default => true),
            :invoice_number => item.receipt_no,
            :item_name => "Membership fee",
            :item_type => "Membership fee",
            :payment_method => item.payment_method,
            :approved_by => @current_user.en_name,
            :provider => "System",
            :approved_at => DateTime.now.strftime('%Y-%m-%d'),
            :amount => fee.content.to_i*-1,
            :is_approved => true,
            :transaction_date => item.paid_at,
            :description => "",
            :receipt => nil
        }) 

        if !tran.valid?
            render status:500, json: {
                message: "invalid",
                error: tran.errors.messages,
                data: nil
            }
            return
        end
        tran.save

        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
        

    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue SecurityTransgression => e
        p e.message
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        p e.message
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def cancel
        raise SecurityTransgression unless @current_user.can_do?("CANCEL_REGISTRATION")

        id = params[:item_id]
        item = Registration.active.find(id.to_i)
        
        if item.status == "Completed"
            render json: { message: "cannot_cancel_completed_record" , error: "cannot_cancel_completed_record" }, status: :internal_server_error
            return
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
    rescue SecurityTransgression => e
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

        if !item.paid
            render json: { message: "not_paid_yet" , error: "not_paid_yet" }, status: :internal_server_error
            return
        end

        fee = SystemConfig.find_by(code: "MEMBERSHIP_FEE")
        account = Account.find_by(:is_default => true)
        random_token = SecureRandom.urlsafe_base64(8, false)
        item.status = "Completed"

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        tran = Transaction.new({
            :account => account,
            :invoice_number => item.receipt_no,
            :item_name => "Membership fee",
            :item_type => "Membership fee",
            :payment_method => item.payment_method,
            :approved_by => @current_user.en_name,
            :provider => "System",
            :approved_at => DateTime.now.strftime('%Y-%m-%d'),
            :amount => fee.content.to_i,
            :is_approved => true,
            :transaction_date => item.paid_at,
            :description => "",
            :receipt => nil
        }) 
        if !tran.valid?
            render status:500, json: {
                message: "invalid",
                error: tran.errors.messages,
                data: nil
            }
            return
        end
        
        if !item.member.present?
            if Member.exists?(email: item.email) 
                member = Member.find_by(email: item.email)
                item.member = member
            else
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
                    tran.destroy
                    render status:500, json: {
                        message: "invalid",
                        error: item.errors.messages,
                        data: nil
                    }
                    return
                end
                member.save
                item.member = member
            end
            if !item.valid?
                member.destroy
            end
        end
        tran.save
        item.save

        render json: {
            message: "success",
            error: nil,
            data: ReturnMemberFormat(item.member)
        }
        

    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue SecurityTransgression => e
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
                :url => item.proof.url(:original),
                :filename => item.proof_file_name,
                :filesize => item.proof_file_size
            }
        end
        
        result[:member] = item.member
        
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
