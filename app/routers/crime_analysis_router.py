"""
Crime Analysis Router
- Receive state, district, user coordinates
- Filter crime dataset
- Generate hotspot coordinates around city center
- Return structured JSON for frontend visualization
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import random
import os

router = APIRouter(
    prefix="/crime",
    tags=["Crime Analysis"]
)

# ── Request model ──────────────────────────────────────────────
class CrimeAnalysisRequest(BaseModel):
    state: str
    district: str
    user_lat: float = 0.0
    user_lng: float = 0.0

# ── City center coordinates ───────────────────────────────────
CITY_COORDINATES = {
    # Uttar Pradesh
    ("Uttar Pradesh", "Lucknow"): (26.8467, 80.9462),
    ("Uttar Pradesh", "Kanpur Nagar"): (26.4499, 80.3319),
    ("Uttar Pradesh", "Varanasi"): (25.3176, 82.9739),
    ("Uttar Pradesh", "Agra"): (27.1767, 78.0081),
    ("Uttar Pradesh", "Prayagraj"): (25.4358, 81.8463),
    ("Uttar Pradesh", "Ghaziabad"): (28.6692, 77.4538),
    ("Uttar Pradesh", "Meerut"): (28.9845, 77.7064),
    ("Uttar Pradesh", "Gorakhpur"): (26.7606, 83.3732),
    ("Uttar Pradesh", "Bareilly"): (28.3670, 79.4304),
    ("Uttar Pradesh", "Aligarh"): (27.8974, 78.0880),
    ("Uttar Pradesh", "Moradabad"): (28.8386, 78.7733),
    ("Uttar Pradesh", "Noida"): (28.5355, 77.3910),
    ("Uttar Pradesh", "Jhansi"): (25.4484, 78.5685),
    ("Uttar Pradesh", "Ayodhya"): (26.7922, 82.1998),
    ("Uttar Pradesh", "Mathura"): (27.4924, 77.6737),
    ("Uttar Pradesh", "Shahjahanpur"): (27.8831, 79.9110),
    ("Uttar Pradesh", "Sitapur"): (27.5730, 80.6833),
    ("Uttar Pradesh", "Raebareli"): (26.2345, 81.2409),
    ("Uttar Pradesh", "Saharanpur"): (29.9680, 77.5460),
    ("Uttar Pradesh", "Firozabad"): (27.1506, 78.3956),
    ("Uttar Pradesh", "Muzaffarnagar"): (29.4727, 77.7085),
    ("Uttar Pradesh", "Ballia"): (25.7589, 84.1489),
    ("Uttar Pradesh", "Basti"): (26.8023, 82.7468),
    ("Uttar Pradesh", "Etawah"): (26.7856, 79.0230),
    ("Uttar Pradesh", "Mirzapur"): (25.1462, 82.5690),
    # Maharashtra
    ("Maharashtra", "Mumbai"): (19.0760, 72.8777),
    ("Maharashtra", "Pune"): (18.5204, 73.8567),
    ("Maharashtra", "Nagpur"): (21.1458, 79.0882),
    ("Maharashtra", "Thane"): (19.2183, 72.9781),
    ("Maharashtra", "Nashik"): (19.9975, 73.7898),
    ("Maharashtra", "Aurangabad"): (19.8762, 75.3433),
    ("Maharashtra", "Solapur"): (17.6599, 75.9064),
    ("Maharashtra", "Amravati"): (20.9320, 77.7523),
    ("Maharashtra", "Kolhapur"): (16.7050, 74.2433),
    ("Maharashtra", "Sangli"): (16.8524, 74.5815),
    ("Maharashtra", "Jalgaon"): (21.0077, 75.5626),
    ("Maharashtra", "Satara"): (17.6805, 74.0183),
    ("Maharashtra", "Latur"): (18.3980, 76.5604),
    ("Maharashtra", "Ahmednagar"): (19.0948, 74.7480),
    ("Maharashtra", "Chandrapur"): (19.9500, 79.2960),
    ("Maharashtra", "Beed"): (18.9890, 75.7531),
    ("Maharashtra", "Akola"): (20.7070, 77.0079),
    ("Maharashtra", "Nanded"): (19.1383, 77.3210),
    ("Maharashtra", "Ratnagiri"): (16.9902, 73.3120),
    ("Maharashtra", "Wardha"): (20.7453, 78.6022),
    ("Maharashtra", "Buldhana"): (20.5293, 76.1842),
    ("Maharashtra", "Dhule"): (20.9042, 74.7749),
    ("Maharashtra", "Parbhani"): (19.2615, 76.7732),
    ("Maharashtra", "Osmanabad"): (18.1860, 76.0340),
    ("Maharashtra", "Palghar"): (19.6967, 72.7699),
    # Bihar
    ("Bihar", "Patna"): (25.6093, 85.1376),
    ("Bihar", "Gaya"): (24.7955, 84.9994),
    ("Bihar", "Muzaffarpur"): (26.1209, 85.3647),
    ("Bihar", "Bhagalpur"): (25.2425, 86.9842),
    ("Bihar", "Darbhanga"): (26.1542, 85.8918),
    ("Bihar", "Purnia"): (25.7771, 87.4753),
    ("Bihar", "Nalanda"): (25.1356, 85.4429),
    ("Bihar", "Siwan"): (26.2179, 84.3612),
    ("Bihar", "Saran"): (25.8434, 84.8543),
    ("Bihar", "Begusarai"): (25.4182, 86.1272),
    ("Bihar", "Arrah"): (25.5569, 84.6634),
    ("Bihar", "Katihar"): (25.5390, 87.5719),
    ("Bihar", "Madhubani"): (26.3584, 86.0718),
    ("Bihar", "Saharsa"): (25.8784, 86.6024),
    ("Bihar", "Samastipur"): (25.8586, 85.7930),
    ("Bihar", "Motihari"): (26.6470, 84.9183),
    ("Bihar", "Buxar"): (25.5622, 83.9784),
    ("Bihar", "Rohtas"): (24.9603, 84.0063),
    ("Bihar", "Sitamarhi"): (26.5972, 85.4809),
    ("Bihar", "Kishanganj"): (26.1112, 87.9375),
    ("Bihar", "Jamui"): (24.9245, 86.2245),
    ("Bihar", "Araria"): (26.1491, 87.5145),
    ("Bihar", "Gopalganj"): (26.4710, 84.4380),
    ("Bihar", "Khagaria"): (25.5025, 86.4678),
    ("Bihar", "Banka"): (24.8891, 86.9215),
    # West Bengal
    ("West Bengal", "Kolkata"): (22.5726, 88.3639),
    ("West Bengal", "Howrah"): (22.5958, 88.2636),
    ("West Bengal", "Darjeeling"): (27.0360, 88.2627),
    ("West Bengal", "Malda"): (25.0108, 88.1410),
    ("West Bengal", "Murshidabad"): (24.1825, 88.2666),
    ("West Bengal", "North 24 Parganas"): (22.6170, 88.4200),
    ("West Bengal", "South 24 Parganas"): (22.1607, 88.4300),
    ("West Bengal", "Hooghly"): (22.9100, 88.3900),
    ("West Bengal", "Bardhaman"): (23.2500, 87.8500),
    ("West Bengal", "Siliguri"): (26.7271, 88.3953),
    ("West Bengal", "Nadia"): (23.3900, 88.5100),
    ("West Bengal", "Bankura"): (23.2500, 87.0600),
    ("West Bengal", "Purulia"): (23.3300, 86.3700),
    ("West Bengal", "Cooch Behar"): (26.3200, 89.4500),
    ("West Bengal", "Jalpaiguri"): (26.5200, 88.7300),
    ("West Bengal", "Birbhum"): (23.8600, 87.6200),
    ("West Bengal", "Alipurduar"): (26.4900, 89.5300),
    ("West Bengal", "Kalimpong"): (27.0660, 88.4698),
    ("West Bengal", "Midnapore"): (22.4250, 87.3190),
    ("West Bengal", "Basirhat"): (22.6547, 88.8887),
    ("West Bengal", "Asansol"): (23.6837, 86.9528),
    ("West Bengal", "Durgapur"): (23.5204, 87.3119),
    ("West Bengal", "Barrackpore"): (22.7664, 88.3788),
    ("West Bengal", "Chandannagar"): (22.8671, 88.3632),
    ("West Bengal", "Haldia"): (22.0667, 88.0698),
    # Madhya Pradesh
    ("Madhya Pradesh", "Bhopal"): (23.2599, 77.4126),
    ("Madhya Pradesh", "Indore"): (22.7196, 75.8577),
    ("Madhya Pradesh", "Gwalior"): (26.2183, 78.1828),
    ("Madhya Pradesh", "Jabalpur"): (23.1815, 79.9864),
    ("Madhya Pradesh", "Ujjain"): (23.1765, 75.7885),
    ("Madhya Pradesh", "Sagar"): (23.8388, 78.7378),
    ("Madhya Pradesh", "Rewa"): (24.5362, 81.2989),
    ("Madhya Pradesh", "Satna"): (24.5805, 80.8322),
    ("Madhya Pradesh", "Ratlam"): (23.3315, 75.0367),
    ("Madhya Pradesh", "Chhindwara"): (22.0574, 78.9382),
    ("Madhya Pradesh", "Dewas"): (22.9676, 76.0534),
    ("Madhya Pradesh", "Sehore"): (23.2050, 77.0900),
    ("Madhya Pradesh", "Vidisha"): (23.5239, 77.8081),
    ("Madhya Pradesh", "Shivpuri"): (25.4310, 77.6610),
    ("Madhya Pradesh", "Khandwa"): (21.8245, 76.3523),
    ("Madhya Pradesh", "Neemuch"): (24.4741, 74.8680),
    ("Madhya Pradesh", "Mandsaur"): (24.0760, 75.0690),
    ("Madhya Pradesh", "Balaghat"): (21.8100, 80.1800),
    ("Madhya Pradesh", "Betul"): (21.9041, 77.9000),
    ("Madhya Pradesh", "Hoshangabad"): (22.7468, 77.7339),
    ("Madhya Pradesh", "Katni"): (23.8342, 80.3939),
    ("Madhya Pradesh", "Singrauli"): (24.1997, 82.6748),
    ("Madhya Pradesh", "Damoh"): (23.8363, 79.4419),
    ("Madhya Pradesh", "Datia"): (25.6697, 78.4607),
    ("Madhya Pradesh", "Morena"): (26.4998, 78.0008),
    # Tamil Nadu
    ("Tamil Nadu", "Chennai"): (13.0827, 80.2707),
    ("Tamil Nadu", "Coimbatore"): (11.0168, 76.9558),
    ("Tamil Nadu", "Madurai"): (9.9252, 78.1198),
    ("Tamil Nadu", "Salem"): (11.6643, 78.1460),
    ("Tamil Nadu", "Tiruchirappalli"): (10.7905, 78.7047),
    ("Tamil Nadu", "Tirunelveli"): (8.7139, 77.7567),
    ("Tamil Nadu", "Vellore"): (12.9165, 79.1325),
    ("Tamil Nadu", "Erode"): (11.3410, 77.7172),
    ("Tamil Nadu", "Thoothukudi"): (8.7642, 78.1348),
    ("Tamil Nadu", "Dindigul"): (10.3673, 77.9803),
    ("Tamil Nadu", "Cuddalore"): (11.7560, 79.7680),
    ("Tamil Nadu", "Karur"): (10.9601, 78.0766),
    ("Tamil Nadu", "Thanjavur"): (10.7870, 79.1378),
    ("Tamil Nadu", "Kanchipuram"): (12.8342, 79.7036),
    ("Tamil Nadu", "Tiruppur"): (11.1085, 77.3411),
    ("Tamil Nadu", "Nagapattinam"): (10.7672, 79.8449),
    ("Tamil Nadu", "Namakkal"): (11.2189, 78.1674),
    ("Tamil Nadu", "Krishnagiri"): (12.5186, 78.2138),
    ("Tamil Nadu", "Ramanathapuram"): (9.3639, 78.8395),
    ("Tamil Nadu", "Sivaganga"): (10.4392, 78.4926),
    ("Tamil Nadu", "Virudhunagar"): (9.5851, 77.9526),
    ("Tamil Nadu", "Ariyalur"): (11.1428, 79.0774),
    ("Tamil Nadu", "Perambalur"): (11.2320, 78.8800),
    ("Tamil Nadu", "Dharmapuri"): (12.1211, 78.1582),
    ("Tamil Nadu", "Theni"): (10.0104, 77.4768),
    # Rajasthan
    ("Rajasthan", "Jaipur"): (26.9124, 75.7873),
    ("Rajasthan", "Jodhpur"): (26.2389, 73.0243),
    ("Rajasthan", "Udaipur"): (24.5854, 73.7125),
    ("Rajasthan", "Kota"): (25.2138, 75.8648),
    ("Rajasthan", "Ajmer"): (26.4499, 74.6399),
    ("Rajasthan", "Bikaner"): (28.0229, 73.3119),
    ("Rajasthan", "Alwar"): (27.5530, 76.6346),
    ("Rajasthan", "Bharatpur"): (27.2152, 77.4898),
    ("Rajasthan", "Sikar"): (27.6094, 75.1399),
    ("Rajasthan", "Pali"): (25.7725, 73.3234),
    ("Rajasthan", "Barmer"): (25.7495, 71.3893),
    ("Rajasthan", "Jaisalmer"): (26.9157, 70.9083),
    ("Rajasthan", "Churu"): (28.3074, 74.9670),
    ("Rajasthan", "Tonk"): (26.1665, 75.7885),
    ("Rajasthan", "Bhilwara"): (25.3407, 74.6313),
    ("Rajasthan", "Nagaur"): (27.2024, 73.7330),
    ("Rajasthan", "Dausa"): (26.8869, 76.3367),
    ("Rajasthan", "Hanumangarh"): (29.5808, 74.3292),
    ("Rajasthan", "Sri Ganganagar"): (29.9038, 73.8772),
    ("Rajasthan", "Jhunjhunu"): (28.1261, 75.3961),
    ("Rajasthan", "Bundi"): (25.4305, 75.6499),
    ("Rajasthan", "Jhalawar"): (24.5970, 76.1653),
    ("Rajasthan", "Sawai Madhopur"): (26.0184, 76.3590),
    ("Rajasthan", "Karauli"): (26.4980, 77.0230),
    ("Rajasthan", "Dungarpur"): (23.8420, 73.7150),
    # Karnataka
    ("Karnataka", "Bengaluru Urban"): (12.9716, 77.5946),
    ("Karnataka", "Bengaluru"): (12.9716, 77.5946),
    ("Karnataka", "Mysuru"): (12.2958, 76.6394),
    ("Karnataka", "Mangaluru"): (12.9141, 74.8560),
    ("Karnataka", "Hubballi"): (15.3647, 75.1240),
    ("Karnataka", "Belagavi"): (15.8497, 74.4977),
    ("Karnataka", "Ballari"): (15.1394, 76.9214),
    ("Karnataka", "Shivamogga"): (13.9299, 75.5681),
    ("Karnataka", "Tumakuru"): (13.3392, 77.1017),
    ("Karnataka", "Udupi"): (13.3409, 74.7421),
    ("Karnataka", "Davanagere"): (14.4644, 75.9218),
    ("Karnataka", "Raichur"): (16.2120, 77.3439),
    ("Karnataka", "Bidar"): (17.9104, 77.5199),
    ("Karnataka", "Kalaburagi"): (17.3297, 76.8343),
    ("Karnataka", "Chikkamagaluru"): (13.3161, 75.7720),
    ("Karnataka", "Hassan"): (13.0033, 76.0961),
    ("Karnataka", "Mandya"): (12.5242, 76.8953),
    ("Karnataka", "Kolar"): (13.1357, 78.1292),
    ("Karnataka", "Gadag"): (15.4319, 75.6379),
    ("Karnataka", "Haveri"): (14.7951, 75.3991),
    ("Karnataka", "Bagalkot"): (16.1691, 75.6615),
    ("Karnataka", "Chitradurga"): (14.2226, 76.3987),
    ("Karnataka", "Kodagu"): (12.4244, 75.7382),
    ("Karnataka", "Yadgir"): (16.7618, 77.1381),
    ("Karnataka", "Vijayapura"): (16.8302, 75.7100),
    ("Karnataka", "Ramanagara"): (12.7159, 77.2810),
    # Gujarat
    ("Gujarat", "Ahmedabad"): (23.0225, 72.5714),
    ("Gujarat", "Surat"): (21.1702, 72.8311),
    ("Gujarat", "Vadodara"): (22.3072, 73.1812),
    ("Gujarat", "Rajkot"): (22.3039, 70.8022),
    ("Gujarat", "Bhavnagar"): (21.7645, 72.1519),
    ("Gujarat", "Jamnagar"): (22.4707, 70.0577),
    ("Gujarat", "Junagadh"): (21.5222, 70.4579),
    ("Gujarat", "Gandhinagar"): (23.2156, 72.6369),
    ("Gujarat", "Kutch"): (23.7337, 69.8597),
    ("Gujarat", "Anand"): (22.5645, 72.9289),
    ("Gujarat", "Mehsana"): (23.5880, 72.3693),
    ("Gujarat", "Valsad"): (20.5992, 72.9342),
    ("Gujarat", "Navsari"): (20.9467, 72.9520),
    ("Gujarat", "Bharuch"): (21.7051, 72.9959),
    ("Gujarat", "Sabarkantha"): (23.6277, 73.0048),
    ("Gujarat", "Patan"): (23.8493, 72.1266),
    ("Gujarat", "Banaskantha"): (24.1790, 72.4370),
    ("Gujarat", "Dahod"): (22.8378, 74.2568),
    ("Gujarat", "Amreli"): (21.6015, 71.2204),
    ("Gujarat", "Porbandar"): (21.6417, 69.6293),
    ("Gujarat", "Surendranagar"): (22.7277, 71.6375),
    ("Gujarat", "Gir Somnath"): (20.8880, 70.3630),
    ("Gujarat", "Botad"): (22.1718, 71.6686),
    ("Gujarat", "Morbi"): (22.8120, 70.8360),
    ("Gujarat", "Aravalli"): (23.5370, 73.2960),
    # Kerala
    ("Kerala", "Thiruvananthapuram"): (8.5241, 76.9366),
    ("Kerala", "Kochi"): (9.9312, 76.2673),
    ("Kerala", "Kozhikode"): (11.2588, 75.7804),
    ("Kerala", "Thrissur"): (10.5276, 76.2144),
    ("Kerala", "Kollam"): (8.8932, 76.6141),
    ("Kerala", "Kannur"): (11.8745, 75.3704),
    ("Kerala", "Alappuzha"): (9.4981, 76.3388),
    ("Kerala", "Palakkad"): (10.7867, 76.6548),
    ("Kerala", "Malappuram"): (11.0510, 76.0711),
    ("Kerala", "Kottayam"): (9.5916, 76.5222),
    ("Kerala", "Idukki"): (9.8494, 76.9710),
    ("Kerala", "Pathanamthitta"): (9.2648, 76.7870),
    ("Kerala", "Wayanad"): (11.6854, 76.1320),
    ("Kerala", "Ernakulam"): (9.9816, 76.2999),
    ("Kerala", "Kasargod"): (12.4996, 74.9869),
    ("Kerala", "Attingal"): (8.6960, 76.8150),
    ("Kerala", "Ponnani"): (10.7670, 75.9270),
    ("Kerala", "Chalakudy"): (10.3000, 76.3300),
    ("Kerala", "Payyanur"): (12.0900, 75.2030),
    ("Kerala", "Nedumangad"): (8.6051, 77.0017),
    ("Kerala", "Muvattupuzha"): (9.9750, 76.5780),
    ("Kerala", "Thodupuzha"): (9.8958, 76.7175),
    ("Kerala", "Changanassery"): (9.4439, 76.5389),
    ("Kerala", "Ottapalam"): (10.7730, 76.3780),
    ("Kerala", "Manjeri"): (11.1197, 76.1197),
    # Punjab
    ("Punjab", "Ludhiana"): (30.9010, 75.8573),
    ("Punjab", "Amritsar"): (31.6340, 74.8723),
    ("Punjab", "Jalandhar"): (31.3260, 75.5762),
    ("Punjab", "Patiala"): (30.3398, 76.3869),
    ("Punjab", "Bathinda"): (30.2110, 74.9455),
    ("Punjab", "Mohali"): (30.7046, 76.7179),
    ("Punjab", "Hoshiarpur"): (31.5282, 75.9112),
    ("Punjab", "Gurdaspur"): (32.0414, 75.4026),
    ("Punjab", "Moga"): (30.8136, 75.1742),
    ("Punjab", "Firozpur"): (30.9330, 74.6133),
    ("Punjab", "Kapurthala"): (31.3809, 75.3821),
    ("Punjab", "Faridkot"): (30.6783, 74.7583),
    ("Punjab", "Sangrur"): (30.2427, 75.8412),
    ("Punjab", "Barnala"): (30.3818, 75.5490),
    ("Punjab", "Ropar"): (30.9660, 76.5230),
    ("Punjab", "Mansa"): (29.9987, 75.3966),
    ("Punjab", "Fazilka"): (30.4040, 74.0280),
    ("Punjab", "Pathankot"): (32.2743, 75.6522),
    ("Punjab", "Tarn Taran"): (31.4517, 74.9279),
    ("Punjab", "Malerkotla"): (30.5299, 75.8847),
    ("Punjab", "Khanna"): (30.6971, 76.2189),
    ("Punjab", "Abohar"): (30.1453, 74.1990),
    ("Punjab", "Rajpura"): (30.4862, 76.5930),
    ("Punjab", "Zirakpur"): (30.6437, 76.8186),
    ("Punjab", "Batala"): (31.8060, 75.2030),
    # Haryana
    ("Haryana", "Gurugram"): (28.4595, 77.0266),
    ("Haryana", "Faridabad"): (28.4089, 77.3178),
    ("Haryana", "Panipat"): (29.3909, 76.9635),
    ("Haryana", "Ambala"): (30.3782, 76.7767),
    ("Haryana", "Hisar"): (29.1492, 75.7217),
    ("Haryana", "Rohtak"): (28.8955, 76.5920),
    ("Haryana", "Sonipat"): (28.9931, 77.0151),
    ("Haryana", "Karnal"): (29.6857, 76.9905),
    ("Haryana", "Yamunanagar"): (30.1283, 77.2911),
    ("Haryana", "Bhiwani"): (28.7975, 76.1397),
    ("Haryana", "Jhajjar"): (28.6066, 76.6565),
    ("Haryana", "Sirsa"): (29.5349, 75.0290),
    ("Haryana", "Kurukshetra"): (29.9695, 76.8783),
    ("Haryana", "Rewari"): (28.1920, 76.6190),
    ("Haryana", "Palwal"): (28.1437, 77.3322),
    ("Haryana", "Mahendragarh"): (28.2776, 76.1530),
    ("Haryana", "Jind"): (29.3159, 76.3143),
    ("Haryana", "Kaithal"): (29.8015, 76.3998),
    ("Haryana", "Nuh"): (28.1058, 77.0005),
    ("Haryana", "Charkhi Dadri"): (28.5893, 76.2711),
    ("Haryana", "Fatehabad"): (29.5157, 75.4572),
    ("Haryana", "Panchkula"): (30.6942, 76.8606),
    ("Haryana", "Hansi"): (29.1063, 75.9610),
    ("Haryana", "Kosli"): (28.0990, 76.4050),
    ("Haryana", "Tohana"): (29.7141, 75.9050),
    # Delhi
    ("Delhi", "Delhi"): (28.6139, 77.2090),
    # Telangana
    ("Telangana", "Hyderabad"): (17.3850, 78.4867),
    # Goa (common request)
    ("Goa", "Goa"): (15.2993, 74.1240),
}

# ── Load dataset once ─────────────────────────────────────────
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "crime.csv")
try:
    crime_df = pd.read_csv(DATASET_PATH)
except FileNotFoundError:
    crime_df = pd.DataFrame()


def _coerce_numeric_column(df: pd.DataFrame, col: str) -> None:
    """Normalize numeric columns that may contain commas and/or strings."""
    if col not in df.columns:
        return
    series = df[col]
    # Convert to string first to safely strip commas, then numeric.
    normalized = (
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.strip()
        .replace({"": None, "nan": None, "None": None})
    )
    df[col] = pd.to_numeric(normalized, errors="coerce")


if not crime_df.empty:
    for numeric_col in [
        "Year",
        "Cases_Reported",
        "Chargesheeted",
        "Convictions",
        "Population",
        "Crime_Rate_per_100k",
    ]:
        _coerce_numeric_column(crime_df, numeric_col)

    # Ensure text columns are strings so .str operations are safe.
    for text_col in ["State", "District", "Crime_Type"]:
        if text_col in crime_df.columns:
            crime_df[text_col] = crime_df[text_col].astype(str)


# ── Endpoint: list available cities ───────────────────────────
@router.get("/cities")
async def list_cities():
    """Return all state-district pairs available in the dataset."""
    if crime_df.empty:
        return {"status": "success", "data": []}
    pairs = (
        crime_df[["State", "District"]]
        .drop_duplicates()
        .sort_values(["State", "District"])
    )
    cities = []
    for _, row in pairs.iterrows():
        s = str(row["State"]).strip()
        d = str(row["District"]).strip()
        if s and d:
            cities.append({"state": s, "district": d, "label": f"{d}, {s}"})
    return {"status": "success", "data": cities}


# ── Helper functions ──────────────────────────────────────────
def generate_random_near_center(center_lat: float, center_lng: float, spread: float = 0.03):
    lat_offset = random.uniform(-spread, spread)
    lng_offset = random.uniform(-spread, spread)
    return round(center_lat + lat_offset, 6), round(center_lng + lng_offset, 6)


def calculate_risk(cases: int) -> str:
    if cases > 1000:
        return "Critical"
    elif cases > 500:
        return "High"
    elif cases > 200:
        return "Medium"
    else:
        return "Low"


# Helper: simulate time-of-day distribution for incident bar chart
TIME_SLOTS = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"]

def simulate_time_distribution(total_cases: int) -> list:
    """Generate plausible time-of-day distribution for crimes."""
    # Realistic weight: more crime in afternoon/evening
    weights = [0.08, 0.04, 0.10, 0.22, 0.30, 0.26]
    distribution = []
    for i, slot in enumerate(TIME_SLOTS):
        count = int(total_cases * weights[i] * random.uniform(0.7, 1.3))
        distribution.append({"time": slot, "count": max(1, count)})
    return distribution


# ── Endpoint ──────────────────────────────────────────────────
@router.post("/analyze")
async def analyze_crime(request: CrimeAnalysisRequest):
    """
    Analyze crime data for a given state + district.
    Returns stats, trends, hotspots with simulated coordinates.
    """
    state = request.state.strip()
    district = request.district.strip()
    user_lat = request.user_lat
    user_lng = request.user_lng

    if crime_df.empty:
        raise HTTPException(status_code=500, detail="Crime dataset not loaded.")

    # Get city center
    key = (state, district)
    if key not in CITY_COORDINATES:
        # Fallback: use user coordinates or a default
        if user_lat != 0.0 and user_lng != 0.0:
            center_lat, center_lng = user_lat, user_lng
        else:
            raise HTTPException(
                status_code=404,
                detail=f"City coordinates not found for ({state}, {district}). Provide user_lat/user_lng as fallback."
            )
    else:
        center_lat, center_lng = CITY_COORDINATES[key]

    # Filter dataset
    filtered = crime_df[
        (crime_df["State"].astype(str).str.strip().str.lower() == state.lower())
        & (crime_df["District"].astype(str).str.strip().str.lower() == district.lower())
    ]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No crime data found for {district}, {state}."
        )

    # ── Aggregated stats ──────────────────────────────────────
    total_cases = int(filtered["Cases_Reported"].sum())
    total_convictions = int(filtered["Convictions"].sum())
    total_chargesheeted = int(filtered["Chargesheeted"].sum())
    population = int(filtered["Population"].iloc[0]) if "Population" in filtered.columns else 0

    # Crime category distribution (aggregate by crime type)
    category_dist = (
        filtered.groupby("Crime_Type")["Cases_Reported"]
        .sum()
        .reset_index()
        .rename(columns={"Crime_Type": "category", "Cases_Reported": "cases"})
        .sort_values("cases", ascending=False)
        .to_dict("records")
    )
    for item in category_dist:
        item["cases"] = int(item["cases"])

    # Year-wise trend (for line chart)
    year_trend = (
        filtered.groupby("Year")["Cases_Reported"]
        .sum()
        .reset_index()
        .rename(columns={"Year": "year", "Cases_Reported": "cases"})
        .sort_values("year")
        .to_dict("records")
    )
    for item in year_trend:
        item["year"] = int(item["year"])
        item["cases"] = int(item["cases"])

    # Crime Risk Index (0–100): based on crime rate
    avg_crime_rate = filtered["Crime_Rate_per_100k"].mean()
    crime_risk_index = min(100, int(avg_crime_rate * 4.5))  # scale up for display

    # Safety score (inverse of risk)
    safety_score = max(0, 100 - crime_risk_index)

    # Conviction rate
    conviction_rate = round((total_convictions / total_chargesheeted * 100), 1) if total_chargesheeted > 0 else 0

    # Time-of-day distribution (simulated)
    time_distribution = simulate_time_distribution(total_cases // len(year_trend) if year_trend else total_cases)

    # ── AI Safety Directive (simple rule-based) ────────────────
    top_crime = category_dist[0]["category"] if category_dist else "crime"
    top_crime_cases = category_dist[0]["cases"] if category_dist else 0
    risk_level = calculate_risk(top_crime_cases)

    if risk_level in ("Critical", "High"):
        directive = f"Avoid {district}'s central areas after 9 PM. High frequency of {top_crime.lower()} reported. Stay in well-lit, populated areas."
    elif risk_level == "Medium":
        directive = f"Exercise caution in {district}. Moderate levels of {top_crime.lower()} observed. Keep valuables secure and stay alert in crowded places."
    else:
        directive = f"{district} shows relatively lower crime rates. Standard safety precautions recommended. Stay aware of your surroundings."

    # ── Generate hotspot markers ──────────────────────────────
    # Group by crime type, pick top entries for map markers
    hotspot_groups = (
        filtered.groupby("Crime_Type")
        .agg({"Cases_Reported": "sum", "Crime_Rate_per_100k": "mean"})
        .reset_index()
        .sort_values("Cases_Reported", ascending=False)
        .head(8)
    )

    # Generate named hotspot locations (simulate realistic area names)
    area_suffixes = [
        "Market", "Station Road", "Beach Shore", "Old Town", "Main Bazaar",
        "Ring Road", "Bus Stand Area", "Temple Street", "Lake Side", "Mall Road",
        "Highway Junction", "Colony", "Industrial Area", "University Area", "Fort Area"
    ]

    hotspots = []
    used_suffixes = set()
    for _, row in hotspot_groups.iterrows():
        lat, lng = generate_random_near_center(center_lat, center_lng, spread=0.025)
        crime_type = row["Crime_Type"]
        cases = int(row["Cases_Reported"])
        risk = calculate_risk(cases)

        # Pick a unique area name
        suffix = random.choice([s for s in area_suffixes if s not in used_suffixes] or area_suffixes)
        used_suffixes.add(suffix)
        area_name = f"{district} {suffix}"

        hotspots.append({
            "lat": lat,
            "lng": lng,
            "area_name": area_name,
            "crime_type": crime_type,
            "cases": cases,
            "risk": risk,
        })

    return {
        "status": "success",
        "data": {
            "city_center": {"lat": center_lat, "lng": center_lng},
            "user_location": {"lat": user_lat if user_lat != 0 else center_lat, "lng": user_lng if user_lng != 0 else center_lng},
            "district": district,
            "state": state,
            "population": population,
            "total_reported_incidents": total_cases,
            "crime_risk_index": crime_risk_index,
            "safety_score": safety_score,
            "conviction_rate": conviction_rate,
            "category_distribution": category_dist,
            "year_trend": year_trend,
            "time_distribution": time_distribution,
            "ai_safety_directive": directive,
            "hotspots": hotspots,
            "total_hotspots": len(hotspots),
        }
    }
