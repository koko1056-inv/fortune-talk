import { useEffect, useState, useCallback } from 'react';
import { Purchases, PurchasesPackage, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
// import { Platform } from 'react-native'; 
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
    ios: "sk_dpiSIvxUZEEXFmwgKVlJHXlkPHgvo", // RevenueCatで取得したiOS用APIキー
    android: "goog_YOUR_ANDROID_API_KEY_HERE", // Androidも対応する場合
};

export const useInAppPurchase = () => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            // Only run on native platforms
            if (!Capacitor.isNativePlatform()) {
                console.log("Not a native platform, skipping IAP init");
                return;
            }

            try {
                if (Capacitor.getPlatform() === 'ios') {
                    await Purchases.configure({ apiKey: API_KEYS.ios });
                } else if (Capacitor.getPlatform() === 'android') {
                    await Purchases.configure({ apiKey: API_KEYS.android });
                }

                await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);

                await loadOfferings();
                setIsReady(true);
            } catch (error) {
                console.error("Failed to init IAP:", error);
            }
        };

        init();
    }, []);

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                setPackages(offerings.current.availablePackages);
            }
        } catch (error) {
            console.error("Failed to load offerings:", error);
        }
    };

    const purchasePackage = async (pkg: PurchasesPackage) => {
        if (!Capacitor.isNativePlatform()) {
            toast.error("Web版ではアプリ内課金を利用できません");
            return false;
        }

        setLoading(true);
        try {
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
            setCustomerInfo(customerInfo);
            toast.success("購入が完了しました");
            return true;
        } catch (error: any) {
            if (error.userCancelled) {
                // User cancelled, do nothing
            } else {
                console.error("Purchase failed:", error);
                toast.error("購入に失敗しました");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const restorePurchases = async () => {
        setLoading(true);
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            toast.success("購入を復元しました");
        } catch (error) {
            console.error("Restore failed:", error);
            toast.error("復元に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return {
        isReady,
        packages,
        customerInfo,
        purchasePackage,
        restorePurchases,
        loading
    };
};
