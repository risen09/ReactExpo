export type VkLoginRequest = {
  code: string;
  code_verifier: string;
  device_i: string;
  redirect_uri: string;
}