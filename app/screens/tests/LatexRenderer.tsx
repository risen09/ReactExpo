import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View, StyleSheet, Platform } from 'react-native';
import { useRef, useState } from 'react';

const LatexView = ({ latex, style }: { latex: string; style?: any }) => {
  const webViewRef = useRef(null);
  const [webViewHeight, setWebViewHeight] = useState(140);

  // Функция для обработки смешанного текста (LaTeX + обычный текст)
  const processMixedContent = (text: string) => {
    // Заменяем $...$ на <span class="inline-katex">...</span>
    return text
      .replace(/\$(.*?)\$/g, '<span class="inline-katex">$1</span>')
      .replace(/\$\$(.*?)\$\$/g, '<div class="block-katex">$1</div>');
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 10px;
          background-color: transparent;
          color: ${style?.color || '#000'};
          font-size: ${style?.fontSize || '16px'};
        }
        .inline-katex, .block-katex {
          color: ${style?.color || '#000'};
        }
      </style>
    </head>
    <body>
      <div id="katex-container">${processMixedContent(latex)}</div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          try {
            // Рендерим inline-формулы
            document.querySelectorAll('.inline-katex').forEach(el => {
              katex.render(el.textContent, el, {
                throwOnError: false,
                displayMode: false, // Строчный режим
              });
            });

            // Рендерим block-формулы
            document.querySelectorAll('.block-katex').forEach(el => {
              katex.render(el.textContent, el, {
                throwOnError: false,
                displayMode: true, // Блочный режим
              });
            });

            // Отправляем высоту в React Native
            window.ReactNativeWebView.postMessage(
              Math.ceil(document.getElementById("katex-container").offsetHeight)
            );
          } catch (err) {
            console.error("KaTeX error:", err);
          }
        });
      </script>
    </body>
    </html>
  `;

  const onMessage = (event: WebViewMessageEvent) => {
    const height = parseInt(event.nativeEvent.data, 10);
    if (!isNaN(height)) {
      setWebViewHeight(height + 30);
    }
  };

  return (
    <View style={[styles.container, { height: webViewHeight }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={[styles.webview, style]}
        scalesPageToFit={Platform.OS === 'android'}
        onMessage={onMessage}
        javaScriptEnabled={true}
        injectedJavaScript={`
          window.ReactNativeWebView.postMessage(
            Math.ceil(document.getElementById("katex-container").offsetHeight)
          );
          true;
        `}
        mixedContentMode="always"
        androidLayerType="hardware"
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

export default LatexView;