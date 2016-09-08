.DEFAULT=deploy

AWS_DEFAULT_PROFILE=fibidev

create:
	claudia create --profile $(AWS_DEFAULT_PROFILE)
	               --region us-east-1 
	               --api-module bot 
	               --configure-fb-bot
	               --name $(NAME)

deploy-prod:
	claudia update --profile $(AWS_DEFAULT_PROFILE)

deploy-dev:
	claudia update --profile $(AWS_DEFAULT_PROFILE) \
				   --version development

.PHONY: tests
tests:
	claudia test-lambda --profile $(AWS_DEFAULT_PROFILE) \
						--event ./test/get_event.json
	claudia test-lambda --profile $(AWS_DEFAULT_PROFILE) \
						--event ./test/post_event.json
