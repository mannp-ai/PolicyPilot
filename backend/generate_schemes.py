import os

schemes = [
    ("Atal Pension Yojana", "A guaranteed pension scheme for all citizens of India focused on the unorganized sector."),
    ("PM Suraksha Bima Yojana", "An accident insurance scheme offering death and disability cover for unfortunate accidents."),
    ("PM Jeevan Jyoti Bima Yojana", "A one-year life insurance scheme renewable from year to year to offer life insurance cover."),
    ("Sukanya Samriddhi Yojana", "A small deposit scheme for the girl child as part of Beti Bachao Beti Padhao campaign."),
    ("Stand Up India Scheme", "To facilitate bank loans between 10 lakh and 1 Crore to at least one SC/ST borrower and at least one woman borrower."),
    ("PM Mudra Yojana", "Provides loans up to 10 lakh to non-corporate, non-farm small/micro enterprises."),
    ("Skill India Mission", "Aims to train over 40 crore people in India in different skills by 2022."),
    ("Digital India Mission", "Aims to ensure that Government services are available to citizens electronically by improved online infrastructure."),
    ("Smart Cities Mission", "An urban renewal and retrofitting program to develop smart cities across the country."),
    ("Swachh Bharat Mission", "A country-wide campaign to eliminate open defecation and improve solid waste management."),
    ("Startup India", "An initiative to catalyze startup culture and build a strong and inclusive ecosystem for innovation and entrepreneurship."),
    ("PM SVANidhi", "A special micro-credit facility for street vendors to provide affordable loans."),
    ("Antyodaya Anna Yojana", "To provide highly subsidized food to millions of the poorest families."),
    ("PM Krishi Sinchayee Yojana", "National mission to improve farm productivity and ensure better utilization of the resources in the country."),
    ("Deen Dayal Upadhyaya Gram Jyoti Yojana", "To provide continuous power supply to rural India."),
    ("PM Gram Sadak Yojana", "National-wide plan to provide good all-weather road connectivity to unconnected villages."),
    ("Sansad Adarsh Gram Yojana", "A village development project under which each Member of Parliament takes the responsibility of developing villages."),
    ("Fasal Bima Yojana", "An insurance service for farmers for their yields."),
    ("National Heritage City Development and Augmentation Yojana (HRIDAY)", "Aims to preserve and revitalize soul of the heritage city to reflect the city’s unique character."),
    ("AMRUT Scheme", "Purpose is to ensure that every household has access to a tap with assured supply of water and a sewerage connection."),
    ("PM Kaushal Vikas Yojana", "The flagship scheme of the Ministry of Skill Development & Entrepreneurship (MSDE)."),
    ("UDAAN Scheme", "A regional airport development and 'Regional Connectivity Scheme' (RCS)."),
    ("PM Shram Yogi Maan-dhan", "A voluntary and contributory pension scheme for unorganized workers."),
    ("PM Matru Vandana Yojana", "A maternity benefit program which is a conditional cash transfer scheme.")
]

schemes_dir = r"c:\Users\Mann\Desktop\PolicyPilot\backend\schemes"
os.makedirs(schemes_dir, exist_ok=True)

for name, desc in schemes:
    filename = name.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("-", "_") + ".txt"
    filepath = os.path.join(schemes_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"Scheme Name: {name}\n")
        f.write(f"Description: {desc}\n")
        f.write("Eligibility: All citizens who meet the financial and category criteria defined in the specific policy document.\n")
        f.write("Benefits: Financial assistance, insurance cover, and social security as per the mission goals.\n")

print(f"Created {len(schemes)} additional schemes.")
