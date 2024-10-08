type AICRMResponse = {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
  work_title?: string;
  company_name?: string;
  todays_date?: string;
  social_media_handles?: string;
  connection_type?: string;
  next_action?: string;
  bio?: string;
  original_input?: string;
  response_message?: string;
  requires_follow_up?: boolean;
  additional_details_needed?: boolean;
  other?: string;
};

type CRMMessage = ChatCompletionMessageParam & {
  is_follow_up?: boolean;
};

type AIMessage = {
  parsed?: AICRMResponse;
  refusal?: string;
};
