# Data-lake Monorepo commands

# TERRAFORM commands 
terraform_init: 
	terraform -chdir=terraform init

terraform_staging:
	@echo "Running terraform commands for staging..."
	terraform -chdir=terraform workspace select staging
	terraform -chdir=terraform apply -var-file="vars/staging.tfvars"

terraform_prod:
	@echo "Running terraform commands for staging..."
	terraform -chdir=terraform workspace select prod
	terraform -chdir=terraform apply -var-file="vars/prod.tfvars"


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

