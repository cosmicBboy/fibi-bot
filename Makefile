.DEFAULT=deploy

AWS_DEFAULT_PROFILE=fibidev

deploy:
	claudia create --profile $(AWS_DEFAULT_PROFILE)
	               --region us-east-1 
	               --api-module bot 
	               --configure-fb-bot
	               --name fibi-bot

update-production:
	claudia update --profile $(AWS_DEFAULT_PROFILE)

update-dev:
	claudia update --profile $(AWS_DEFAULT_PROFILE) \
				   --version development

.PHONY: test
test:
	claudia test-lambda --profile $(AWS_DEFAULT_PROFILE) \
						--event ./test/get_event.json
	claudia test-lambda --profile $(AWS_DEFAULT_PROFILE) \
						--event ./test/post_event.json
