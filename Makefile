.DEFAULT=deploy

AWS_DEFAULT_PROFILE=fibidev

.PHONY: dev-deps
dev-deps:
	npm install
	pip install pygments

.PHONY: logs
lambda-logs:
ifndef STREAM_NAMES
	@$(eval OPTS = )
else
	@$(eval OPTS = --log-stream-names $(STREAM_NAMES))
endif
	aws --profile fibidev --region us-east-1 \
		logs filter-log-events --log-group-name /aws/lambda/fibi $(OPTS) |\
		pygmentize -l json

.PHONY: ls-log-streams
ls-log-streams:
	aws --profile fibidev --region us-east-1 \
		logs describe-log-streams --log-group-name /aws/lambda/fibi \
		--order-by LastEventTime |\
		pygmentize -l json |\
		grep logStreamName

.PHONY: set-timeout
set-timout:
	aws --profile $(AWS_DEFAULT_PROFILE) lambda update-function-configuration --function-name fibi --timeout $(T)

.PHONY: add-greeting

.PHONY: add-menu
add-menu:
	curl -X POST -H "Content-Type: application/json" -d '{ \
	  "setting_type" : "call_to_actions", \
	  "thread_state" : "existing_thread", \
	  "call_to_actions":[ \
	    { \
	      "type":"postback", \
	      "title":"Start over", \
	      "payload":"START_OVER" \
	    } \
	  ] \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)" \

.PHONY: rm-menu
rm-menu:
	curl -X DELETE -H "Content-Type: application/json" -d '{ \
	  "setting_type":"call_to_actions", \
	  "thread_state":"existing_thread" \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)"
