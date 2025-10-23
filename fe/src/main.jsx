import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { ConfigProvider } from "antd";

// Components
import { NotificationProvider } from './components/Notification.jsx';

createRoot(document.getElementById('root')).render(
  <ConfigProvider
    theme={{
      token: {
        fontFamily: '"Share Tech", sans-serif',
      },
      components: {
        Checkbox: {
          fontSize: '14px',
          colorText: 'var(--dark3)',
          colorPrimary: 'var(--dark3)',
          controlInteractiveSize: 14,
          colorPrimaryHover: 'var(--dark1)',
        },
        Input: {
          colorBgContainer: 'var(--light)',
          colorText: 'var(--dark2)',
          hoverBorderColor: 'var(--dark2)',
          activeBorderColor: 'var(--dark2)',
          activeShadow: '2px 3px var(--dark2)',
          inputFontSizeLG: '14px',
          colorTextPlaceholder: 'var(--light2)',
        },
        Button: {
          colorPrimary: 'var(--dark3)',
          colorPrimaryHover: 'var(--dark1)',
          colorTextLightSolid: 'var(--mainBg)', 
          colorPrimaryActive: 'var(--dark1)',
        },
        Divider: {
          colorSplit: 'var(--light1)',
          colorTextHeading: 'var(--dark1)',
          colorText: 'var(--dark1)',
          fontSizeLG: 12,  
        },
        Notification: {
          colorSuccess: 'var(--icon)',
          colorText: 'var(--dark1)',
          colorTextHeading: 'var(--dark3)',
        },
        Carousel: {
          dotWidth: 8,
          dotHeight: 8,
          dotActiveWidth: 24,
        },
        Form: {
          itemMarginBottom: 12,
        },
        Radio: {
          colorPrimary: 'var(--dark3)',
          colorPrimaryHover: 'var(--dark1)',
          colorText: 'var(--dark2)',
          fontSize: 14,
          buttonSolidCheckedActiveBg: 'var(--dark1)',
          buttonSolidCheckedBg: 'var(--dark3)',
          buttonSolidCheckedColor: 'var(--mainBg)',
          buttonSolidHoverBg: 'var(--dark2)',
          buttonSolidActiveBg: 'var(--dark1)',
          buttonSolidDisabledBg: 'var(--light1)',
          buttonSolidDisabledColor: 'var(--light3)',
        },
        Select: {
          hoverBorderColor: 'var(--dark2)',
          activeBorderColor: 'var(--dark2)',
          activeShadow: '2px 3px var(--dark2)',
          colorBgContainer: 'var(--light)',
          colorText: 'var(--dark2)',
          colorTextPlaceholder: 'var(--light2)',
          fontSizeLG: 14,
          dropdownFontSize: 14,
        },
        DatePicker: {
          hoverBorderColor: 'var(--dark2)',
          activeBorderColor: 'var(--dark2)',
          activeShadow: '2px 3px var(--dark2)',
          colorBgContainer: 'var(--light)',
          colorText: 'var(--dark2)',
          colorTextPlaceholder: 'var(--light2)',
          fontSizeLG: 14,
          panelFontSize: 14,
        },
        Collapse: {
          borderRadius: 16,
          contentBg: "var(--light)",
          headerBg: 'var(--light)',
          headerPadding: "0px 0px",
          border: false,
          colorBorder: "transparent"
        },
      }
    }}
  >
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ConfigProvider>
)