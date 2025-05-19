export type VkLoginRequest = {
  code: string;
  code_verifier: string;
  device_id: string;
  redirect_uri: string;
}