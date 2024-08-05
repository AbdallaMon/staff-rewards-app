"use client";
import {useEffect, useState} from "react";
import styles from "./DotsLoader.module.css";

export default function DotsLoader({instantLoading}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined" && !instantLoading) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, []);

    useEffect(() => {
        if (!loading) {
            const dotContainer = document.querySelector(".dot_container");
            dotContainer.classList.add("hid-animation");
        }
    }, [loading]);

    return (
          <div className={`dot_container ${styles.dot_container}`}>
              <div className="w-full h-[20px] text-center">
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
              </div>
          </div>
    );
}
