import requests

# Define the URL and the file path
url = 'http://localhost:5000/upload'
file_path = 'BAM-dcc_Pt100_K-K_I1451B-Draft_V3.3a-signed.xml'

# Prepare the file for upload
with open(file_path, 'rb') as f:
    files = {'file': (file_path, f, 'application/xml')}

    # Send the POST request with the file
    response = requests.post(url, files=files)

    # Print the response from the server
    print(response.status_code)
    print(response.json())
