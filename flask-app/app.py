from flask import Flask, request, jsonify
from flask_cors import CORS

from werkzeug.utils import secure_filename
import os
from dcc_validator import get_signature_details, validate_xml_signature, check_certificate_validity, check_signing_date

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_PATH'] = 4 * 1024 * 1024  # 4 MB max upload size

def parse_subject(subject):
    parts = subject.split(', ')
    return {part.split('=')[0]: part.split('=')[1] for part in parts}


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        print ("post",request.headers)
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
 
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process the file
        details = get_signature_details(file_path)
        if not details:
            return jsonify({'error': 'Failed to process XML file'}), 500

        cert_pem, signing_date, signature_node = details
        
        signature_valid = validate_xml_signature(signature_node, cert_pem)
        cert_info = check_certificate_validity(cert_pem)
        date_valid = check_signing_date(cert_pem, signing_date)
        response = {
            'Certificate Info': cert_info,
            'Signature Validity': 'Valid' if signature_valid else 'Invalid',
            'Date Within Validity': 'Valid' if date_valid else 'Invalid'
        }

        print(response)

        return jsonify(response), 200

if __name__ == '__main__':
    app.run(debug=True)
