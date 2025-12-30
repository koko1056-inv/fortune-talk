import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle deep links from widgets and other sources
 * Supports:
 * - fortunetalk://start-fortune - Opens main page with voice chat ready
 * - fortunetalk://daily-fortune - Opens main page and shows daily fortune dialog
 */
export const useDeepLinks = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle app URL open events (deep links)
        const handleAppUrlOpen = CapacitorApp.addListener('appUrlOpen', (event) => {
            const url = event.url;
            console.log('Deep link received:', url);

            // Parse the deep link
            if (url.includes('fortunetalk://')) {
                const path = url.replace('fortunetalk://', '');

                switch (path) {
                    case 'start-fortune':
                        // Navigate to home page
                        navigate('/');
                        // Dispatch custom event to trigger fortune start
                        window.dispatchEvent(new CustomEvent('widget-start-fortune'));
                        break;

                    case 'daily-fortune':
                        // Navigate to home page
                        navigate('/');
                        // Dispatch custom event to show daily fortune
                        window.dispatchEvent(new CustomEvent('widget-daily-fortune'));
                        break;

                    default:
                        // Unknown deep link, just go home
                        navigate('/');
                }
            }
        });

        // Check if app was launched with a URL
        CapacitorApp.getLaunchUrl().then((result) => {
            if (result?.url) {
                console.log('App launched with URL:', result.url);
                const url = result.url;

                if (url.includes('fortunetalk://')) {
                    const path = url.replace('fortunetalk://', '');

                    switch (path) {
                        case 'start-fortune':
                            navigate('/');
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('widget-start-fortune'));
                            }, 500);
                            break;

                        case 'daily-fortune':
                            navigate('/');
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('widget-daily-fortune'));
                            }, 500);
                            break;

                        default:
                            navigate('/');
                    }
                }
            }
        });

        // Cleanup listener on unmount
        return () => {
            handleAppUrlOpen.remove();
        };
    }, [navigate]);
};
