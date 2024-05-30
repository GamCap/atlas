# Data-lake Monorepo commands

# TERRAFORM commands 
terraform_init: 
	cd terraform && terraform init -backend-config=config.remote.tfbackend

# terraform_staging:
# 	@echo "Running terraform commands for staging..."
# 	cd terraform && terraform workspace select staging
# 	cd terraform && terraform apply

terraform_prod:
	@echo "Running terraform commands for prod..."
	cd terraform && terraform workspace select prod
	cd terraform && terraform apply
