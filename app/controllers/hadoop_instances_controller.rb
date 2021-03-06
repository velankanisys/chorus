require 'allowy'
require 'hadoop_instance_access'

class HadoopInstancesController < ApplicationController
  def create
    instance = Hdfs::InstanceRegistrar.create!(params[:hadoop_instance], current_user)
    QC.enqueue_if_not_queued("HadoopInstance.full_refresh", instance.id)
    present instance, :status => :created
  end

  def index
    present paginate HadoopInstance.scoped
  end

  def show
    present HadoopInstance.find(params[:id])
  end

  def update
    hadoop_instance = HadoopInstance.find(params[:id])
    authorize! :edit, hadoop_instance

    hadoop_instance = Hdfs::InstanceRegistrar.update!(hadoop_instance.id, params[:hadoop_instance], current_user)
    present hadoop_instance
  end
end
