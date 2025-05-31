import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import crypto from 'react-native-quick-crypto';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://id.vk.com/authorize',
};

import { useAuth } from '../../hooks/useAuth';

const YOUR_CLIENT_ID = process.env.EXPO_PUBLIC_VK_CLIENT_ID;
const YOUR_REDIRECT_SCHEME = YOUR_CLIENT_ID ? 'vk' + YOUR_CLIENT_ID : ''; // e.g., vk1234567
const YOUR_REDIRECT_HOST = 'vk.com'; // Or whatever you configure, but docs use this
const SCOPE = 'vkid.personal_info email'; // Or whatever scopes you need, comrade
const OAUTH2_PARAMS = Buffer.from(JSON.stringify({ scope: SCOPE })).toString('base64');

export default function SocialVk() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleVkLogin } = useAuth();
  const redirectUri = makeRedirectUri({
    scheme: YOUR_REDIRECT_SCHEME,
    path: `${YOUR_REDIRECT_HOST}/blank.html`,
    queryParams: {
      oauth2_params: OAUTH2_PARAMS,
    }
  });
  console.log("Generated Redirect URI:", redirectUri); // Посмотрите, какой URI генерируется

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: YOUR_CLIENT_ID!,
      redirectUri: redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response) {
      setIsLoading(false);
      if (response.type === 'success') {
        console.log('VK Login Success:', response);
        const { code, device_id, type } = response.params;
        const originalCodeVerifier = request?.codeVerifier; // PKCE code_verifier

        if (!originalCodeVerifier) {
          console.log('VK Login Error:', 'PKCE code_verifier not found.');
          Alert.alert('Invalid VK login state.'); // VK Login Error
          return;
        }
        
        if (!code || !device_id) { 
          console.log('Unexpected VK response!');
          Alert.alert('Invalid response from VK.');
          return;
        }

        if (type !== 'code_v2') {
          console.log('Unexpected VK response type.');
          return;
        }

        handleVkLogin(code, originalCodeVerifier, device_id).catch(error => {
          console.error('Error exchanging code:', error);
          Alert.alert('Network error or backend is sleeping.');
        });
      }
    }
  }, [request, response]) 

  // VK Auth State
  const [vkAvailable, setVkAvailable] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v2/auth/vk/health`, {
      method: 'GET',
    })
      .then(data => {
        setVkAvailable(true);
      })
      .catch(error => {
        console.error('Error checking VK availability:', error);
        setVkAvailable(false);
      });
  }, []);

  return (
      <TouchableOpacity
        style={[styles.socialButton, styles.vkButton]} // You'll need to add vkButton style
        onPress={() => {
          setIsLoading(true);
          promptAsync()
        }}
        disabled={!request && !vkAvailable} 
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.socialButtonText}>Войти через VK</Text>
        )}
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50, // Slightly smaller than main button
    paddingHorizontal: 16,
    width: '100%', // Make it full width like other inputs/buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  vkButton: {
    backgroundColor: '#0077FF', // VK official blue color
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10, // If you add an icon
  },
})