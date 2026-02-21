import { useEffect, useState } from 'react';
import { Purchases, PurchasesPackage, CustomerInfo, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const API_KEYS = {
    ios: "sk_dpiSIvxUZEEXFmwgKVlJHXlkPHgvo",
    android: "goog_YOUR_ANDROID_API_KEY_HERE",
};

// Full App Store product identifiers (in order: 1, 10, 50, 100 tickets)
const PRODUCT_IDS = [
    'com.fortunetalk.app.ticket_01',
    'com.fortunetalk.app.ticket_10',
    'com.fortunetalk.app.ticket_50',
    'com.fortunetalk.app.ticket_100',
];

export const useInAppPurchase = () => {
    const { user } = useAuth();
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (!Capacitor.isNativePlatform()) {
                console.log("[IAP] Not native, skipping init");
                return;
            }

            try {
                if (Capacitor.getPlatform() === 'ios') {
                    await Purchases.configure({ apiKey: API_KEYS.ios });
                } else if (Capacitor.getPlatform() === 'android') {
                    await Purchases.configure({ apiKey: API_KEYS.android });
                }

                await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

                if (user?.id) {
                    await Purchases.logIn({ appUserID: user.id });
                    console.log("[IAP] Logged in as:", user.id);
                }

                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info.customerInfo);

                await loadOfferings();
                setIsReady(true);
            } catch (error) {
                console.error("[IAP] Init failed:", error);
                setIsReady(true); // still set ready so UI shows
            }
        };

        init();
    }, [user?.id]);

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            console.log("[IAP] getOfferings:", JSON.stringify({
                current: offerings.current?.identifier ?? null,
                allKeys: Object.keys(offerings.all ?? {}),
                packages: offerings.current?.availablePackages?.map(p => ({
                    id: p.identifier,
                    productId: p.product.productIdentifier,
                    price: p.product.priceString,
                })) ?? [],
            }));

            if (offerings.current && offerings.current.availablePackages.length > 0) {
                setPackages(offerings.current.availablePackages);
                console.log("[IAP] Loaded", offerings.current.availablePackages.length, "packages from current offering");
                return;
            }

            // Try any offering
            const allOfferings = Object.values(offerings.all ?? {});
            const firstWithPackages = allOfferings.find(o => o.availablePackages.length > 0);
            if (firstWithPackages) {
                console.log("[IAP] Fallback offering:", firstWithPackages.identifier);
                setPackages(firstWithPackages.availablePackages);
                return;
            }

            console.warn("[IAP] No packages from offerings — will use direct getProducts fallback");
        } catch (error) {
            console.error("[IAP] getOfferings failed:", error);
        }
    };

    /**
     * Purchase by index (0=ticket_01, 1=ticket_10, 2=ticket_50, 3=ticket_100)
     * Tries offerings first, then falls back to direct StoreKit product purchase.
     */
    const purchaseByIndex = async (index: number): Promise<boolean> => {
        if (!Capacitor.isNativePlatform()) {
            toast.error("Web版ではアプリ内課金を利用できません");
            return false;
        }

        setLoading(true);
        try {
            const targetProductId = PRODUCT_IDS[index];
            const shortId = targetProductId.split('.').pop() ?? '';

            // Try packages first
            const pkg = packages.find(p =>
                p.product.productIdentifier === targetProductId ||
                p.product.productIdentifier === shortId ||
                p.identifier === shortId ||
                p.identifier === `package_${shortId}`
            );

            if (pkg) {
                console.log("[IAP] Purchasing via package:", pkg.identifier);
                const result = await Purchases.purchasePackage({ aPackage: pkg });
                setCustomerInfo(result.customerInfo);
                toast.success("購入が完了しました");
                return true;
            }

            // Fallback: direct StoreKit product purchase
            console.log("[IAP] No matching package, trying getProducts for:", targetProductId);
            const { products } = await Purchases.getProducts({ productIdentifiers: [targetProductId] });
            console.log("[IAP] getProducts result:", products.map(p => ({ id: p.productIdentifier, price: p.priceString })));

            if (products.length > 0) {
                const result = await Purchases.purchaseStoreProduct({ product: products[0] });
                setCustomerInfo(result.customerInfo);
                toast.success("購入が完了しました");
                return true;
            }

            // Last resort: try with short ID
            console.log("[IAP] Trying short ID:", shortId);
            const { products: shortProducts } = await Purchases.getProducts({ productIdentifiers: [shortId] });
            if (shortProducts.length > 0) {
                const result = await Purchases.purchaseStoreProduct({ product: shortProducts[0] });
                setCustomerInfo(result.customerInfo);
                toast.success("購入が完了しました");
                return true;
            }

            toast.error("商品が見つかりません。しばらく待ってから再試行してください。");
            return false;

        } catch (error: any) {
            if (error.userCancelled) {
                return false;
            }
            console.error("[IAP] Purchase failed:", error);
            toast.error("購入に失敗しました: " + (error.message ?? ''));
            return false;
        } finally {
            setLoading(false);
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
            if (!error.userCancelled) {
                console.error("[IAP] purchasePackage failed:", error);
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
            setCustomerInfo(info.customerInfo);
            toast.success("購入を復元しました");
        } catch (error) {
            console.error("[IAP] Restore failed:", error);
            toast.error("復元に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return {
        isReady,
        packages,
        customerInfo,
        purchaseByIndex,
        purchasePackage,
        restorePurchases,
        loading
    };
};
