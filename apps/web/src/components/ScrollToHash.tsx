import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
    const { hash, pathname } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace("#", ""));
            if (element) {
                // Delay a bit to ensure the page has rendered
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [hash, pathname]);

    return null;
};

export default ScrollToHash;
