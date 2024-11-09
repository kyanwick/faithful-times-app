import React, { useState, useEffect, useCallback } from 'react';

const PrayerTimes = () => {
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [city, setCity] = useState(null);
    const [region, setRegion] = useState(null);

    // calling Aladhan API and input coordinates to fetch time 
    const fetchPrayerTimes = useCallback(async (latitude, longitude) => {
        const response = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const data = await response.json();

        const filteredTimes = {
            Imsak: data.data.timings.Imsak,
            Fajr: data.data.timings.Fajr,
            Sunrise: data.data.timings.Sunrise,
            Dhuhr: data.data.timings.Dhuhr,
            Sunset: data.data.timings.Sunset,
            Maghrib: data.data.timings.Maghrib,
        };
        setPrayerTimes(filteredTimes);
    }, []);

    // Fetch location by IP and call fetchPrayerTimes with coordinates
    const fetchLocationByIP = useCallback(async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            setCity(data.city);
            setRegion(data.region);

            const { latitude: lat, longitude: long } = data;
            fetchPrayerTimes(lat, long);
        } catch (error) {
            console.error("Error fetching IP location:", error);
        }
    }, [fetchPrayerTimes]);

    const convertTo12 = (time24) => {
        const [hour, minute] = time24.split(':');
        const hourInt = parseInt(hour, 10);
        const ampm = hourInt >= 12 ? 'pm' : 'am';
        const hour12 = hourInt % 12 || 12;
        return `${hour12}:${minute} ${ampm}`;
    };

    const getCurrentPrayer = () => {
        if (!prayerTimes) return null;
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        
        const timeToNumber = (timeStr) => {
            const [hours, minutes] = timeStr.split(':');
            return parseInt(hours) * 100 + parseInt(minutes);
        };

        const times = Object.entries(prayerTimes).map(([prayer, time]) => ({
            prayer,
            timeNumber: timeToNumber(time)
        }));

        times.sort((a, b) => a.timeNumber - b.timeNumber);
        
        for (let i = times.length - 1; i >= 0; i--) {
            if (currentTime >= times[i].timeNumber) {
                return times[i].prayer;
            }
        }
        return times[times.length - 1].prayer;
    };

    const timeToNumber = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        return parseInt(hours) * 100 + parseInt(minutes);
    };

    const getTimeUntilNextPrayer = () => {
        if (!prayerTimes) return null;
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
    
        const prayerTimesArr = Object.entries(prayerTimes).map(([prayer, time]) => ({
            prayer,
            timeNumber: timeToNumber(time),
        }));
    
        prayerTimesArr.sort((a, b) => a.timeNumber - b.timeNumber);
    
        for (let i = 0; i < prayerTimesArr.length; i++) {
            if (currentTime < prayerTimesArr[i].timeNumber) {
                let timeDifference = prayerTimesArr[i].timeNumber - currentTime;
                let hours = Math.floor(timeDifference / 100);
                let minutes = timeDifference % 100;

                // adjust minutes 
                if (minutes >= 60) {
                    minutes -= 60;
                    hours += 1;
                }

                return `${hours}h ${minutes}m`;
            }
        }
    
        return 'Next day'; 
    };

    useEffect(() => {
        fetchLocationByIP();
    }, [fetchLocationByIP]);

    return (
        <div className="prayer-container">
            <div className="prayer-card">
                <div className="card-header">
                    <h1 className="card-title">Shia Islam Prayer Times</h1>
                    {city && region && (
                        <div className="location">
                          <span role="img" aria-label="pin">📍</span> {city}, {region}
                        </div>
                    )}
                </div>
                
                <div className="card-content">
                    {prayerTimes ? (
                        <div className="prayer-list">
                            {Object.entries(prayerTimes).map(([prayer, time]) => (
                                <div
                                    key={prayer}
                                    className={`prayer-item ${prayer === getCurrentPrayer() ? 'active' : ''}`}
                                >
                                    <div className="prayer-name">
                                    <span role="img" aria-label="clock">🕒</span> {prayer}
                                    </div>
                                    <div className="prayer-time">
                                        {convertTo12(time)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                    <div className="next-prayer-time">
                        <h3>Time until next prayer: {getTimeUntilNextPrayer()}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrayerTimes;
