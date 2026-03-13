import pandas as pd

# Create the data
data = {
    'Date': ['2025-12-18', '2025-12-17', '2025-12-16', '2025-12-15', '2025-12-14', 
             '2025-12-13', '2025-12-12', '2025-12-11', '2025-12-10', 'Total Hours'],
    'Hours': [2, 2, 2, 2, 2, 2, 2, 2, 2, 18],
    'Description': [
        'Initial project setup and environment configuration',
        'Core module development and implementation',
        'Testing and bug fixes',
        'Documentation and user guide creation',
        'Feature enhancement and optimization',
        'Code review and quality assurance',
        'Database integration and API development',
        'Frontend UI/UX improvements',
        'Backend service implementation',
        ''
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
df.to_excel('work-hours-report.xlsx', index=False)

print("Excel file 'work-hours-report.xlsx' has been created successfully!")