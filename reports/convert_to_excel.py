import pandas as pd

# Read the CSV file
df = pd.read_csv('work-hours-report.csv')

# Convert to Excel
df.to_excel('work-hours-report.xlsx', index=False)

print("Excel file created successfully!")