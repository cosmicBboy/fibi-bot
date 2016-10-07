.DEFAULT=deploy

AWS_DEFAULT_PROFILE=fibidev

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
