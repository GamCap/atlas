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


#DBT commands

dbt_compile:
	cd dbt/ && dbt compile

dbt_clean:
	cd dbt/ && dbt clean

dbt_staging:
	@echo "Running dbt for staging..."
	cd dbt && dbt run

dbt_prod:
	@echo "Running dbt for prod..."
	cd dbt && dbt run --target prod

