import xmlsec
from lxml import etree
import subprocess
from datetime import datetime
import pytz
from prettytable import PrettyTable

def extract_namespaces(xml_root):
    """Extract namespaces from the XML root element for use in XPath queries."""
    ns_map = xml_root.nsmap
    default_ns = ns_map.pop(None, None)
    if default_ns:
        ns_map['default'] = default_ns  # Handle default namespace, if needed
    return ns_map

def get_signature_details(xml_file_path):
    # Load the XML file
    try:
        tree = etree.parse(xml_file_path)
        root = tree.getroot()
    except Exception as e:
        print(f"Failed to parse XML: {e}")
        return None

    # Extract namespaces dynamically
    ns = extract_namespaces(root)
    # Ensuring required namespaces are available
    dsig_ns = ns.get('dsig', 'http://www.w3.org/2000/09/xmldsig#')
    xades_ns = ns.get('xades', 'http://uri.etsi.org/01903/v1.3.2#')

    # Validate that the required namespaces are in the map
    if 'dsig' not in ns:
        ns['dsig'] = dsig_ns
    if 'xades' not in ns:
        ns['xades'] = xades_ns

    # Find the Signature element using the correct namespace
    signature_node = xmlsec.tree.find_node(root, xmlsec.constants.NodeSignature, namespace=dsig_ns)
    if signature_node is None:
        print("Signature element not found.")
        return None

    # Extract signing time using namespaces
    signing_time_node = signature_node.xpath('.//xades:SigningTime', namespaces=ns)
    if not signing_time_node:
        print("Signing time element not found.")
        signing_date = "Unknown"
    else:
        signing_date = signing_time_node[0].text

    # Extract certificate
    x509_certificate_node = signature_node.xpath('.//dsig:X509Certificate', namespaces=ns)
    if not x509_certificate_node:
        print("X509Certificate element not found.")
        return None

    cert_pem = f"-----BEGIN CERTIFICATE-----\n{x509_certificate_node[0].text.strip()}\n-----END CERTIFICATE-----"
    return cert_pem, signing_date, signature_node

# The rest of your existing functions here...

if __name__ == "__main__":
    xml_file_path = 'your_xml_file.xml'
    details = get_signature_details(xml_file_path)
    if details:
        cert_pem, signing_date, signature_node = details
        
        validate_xml_signature(signature_node, cert_pem)    

        check_certificate_validity(cert_pem)

        info = check_certificate_validity(cert_pem)

        info["Signing Date"] = signing_date
        info["Signature Hash"] = "Valid" if validate_xml_signature(signature_node, cert_pem) else "Invalid"
        info["Signature Date"] = "Valid" if check_signing_date(cert_pem, signing_date) else "Invalid"

        if info:
            display_info_table(info)
        else:
            print("No information found or error occurred.")

def validate_xml_signature(signature_node,cert_pem):

    if signature_node is None:
        print("Signature element not found.")
        return False

    # Create a digital signature context
    dsig_ctx = xmlsec.SignatureContext()

    # Setup the key and other necessary things before verification
    try:
        key = xmlsec.Key.from_memory(cert_pem, xmlsec.KeyFormat.CERT_PEM)
        dsig_ctx.key = key

        # Validate the signature
        dsig_ctx.verify(signature_node)
        print("Signature is valid.")
        return True
    except xmlsec.VerificationError:
        print("Signature is invalid.")
        return False
    except Exception as e:
        print(f"An error occurred during signature verification: {e}")
        return False

def check_certificate_validity(cert_pem):
    # Save the certificate to a temporary file
    with open('temp_cert.pem', 'w') as f:
        f.write(cert_pem)
    
    # Use OpenSSL to check the validity
    result = subprocess.run(['openssl', 'x509', '-in', 'temp_cert.pem', '-noout', '-text'], capture_output=True, text=True)
    if result.returncode != 0:
        print("Error extracting certificate info:", result.stderr)
        return {}

    output = result.stdout
    print (output)
    info = {
        'Issuer': None,
        'Valid From': None,
        'Valid To': None,
        'Subject': None
    }

    for line in output.splitlines():
        if 'Issuer:' in line:
            info['Issuer'] = line.split('Issuer:')[1].strip()
        elif 'Not Before:' in line:
            info['Valid From'] = line.split('Not Before:')[1].strip()
        elif 'Not After :' in line:
            info['Valid To'] = line.split('Not After :')[1].strip()
        elif 'Subject:' in line:
            info['Subject'] = line.split('Subject:')[1].strip()

    return info

def extract_certificate_dates(cert_pem):
    # Save the certificate to a temporary file
    with open('temp_cert.pem', 'w') as f:
        f.write(cert_pem)

    # Use OpenSSL to extract the not before and not after dates
    result = subprocess.run(['openssl', 'x509', '-in', 'temp_cert.pem', '-noout', '-dates'], capture_output=True, text=True)
    if result.returncode != 0:
        print("Error extracting certificate dates:", result.stderr)
        return None, None

    output = result.stdout.splitlines()
    not_before = output[0].split('=')[1].strip() if 'notBefore' in output[0] else None
    not_after = output[1].split('=')[1].strip() if 'notAfter' in output[1] else None
    return not_before, not_after

def check_signing_date(cert_pem, signing_date_str):
    not_before_str, not_after_str = extract_certificate_dates(cert_pem)
    if not not_before_str or not not_after_str:
        print("Failed to retrieve valid date ranges from the certificate.")
        return False

    # Convert date strings to datetime objects
    not_before = datetime.strptime(not_before_str, '%b %d %H:%M:%S %Y %Z')
    not_after = datetime.strptime(not_after_str, '%b %d %H:%M:%S %Y %Z')
    signing_date = datetime.strptime(signing_date_str, '%Y-%m-%dT%H:%M:%SZ')

    # Convert all dates to UTC
    not_before = pytz.utc.localize(not_before)
    not_after = pytz.utc.localize(not_after)
    signing_date = pytz.utc.localize(signing_date)

    # Check if the signing date is within the certificate's validity period
    if not_before <= signing_date <= not_after:
        print(f"Signing date {signing_date} is within the valid range ({not_before}-{not_after}) of the certificate.")
        return True
    else:
        print("Signing date is not within the valid range of the certificate.")
        return False


def display_info_table(info):
    # Create a table with headers
    table = PrettyTable()
    table.field_names = ["Info", "Details"]
    table.max_width = 60  # Set maximum width for each column to 30 characters

    # Configure alignment and other properties to make the table more compact
    table.align["Info"] = "l"  # Align left the "Info" column
    table.align["Details"] = "l"  # Align left the "Details" column
    table.valign = "m"  # Middle align vertically
    # table.set_style(1)  # Choose a compact style with fewer borders

    # Abbreviate long text fields if needed
    for key, value in info.items():
        # If the value is too long, abbreviate it
        if value and len(value) > 60:
            value = value[:57] + '...'
        table.add_row([key, value])

    # Print the table in a nice format
    print(table)

if __name__ == "__main__":
    xml_file_path = 'BAM-dcc_Pt100_K-K_I1451B-Draft_V3.3a-signed.xml'
    details = get_signature_details(xml_file_path)
    if details:
        cert_pem, signing_date, signature_node = details
        
        validate_xml_signature(signature_node,cert_pem)    

        check_certificate_validity(cert_pem)

        info = check_certificate_validity(cert_pem)

        info["Signing Date"]= signing_date
        info["Signiture hash"]= "Valid" if validate_xml_signature(signature_node,cert_pem)  else "Invalid"
        info["Signiture date"]= "Valid" if check_signing_date(cert_pem, signing_date)  else "Invalid"



        if info:
            display_info_table(info)
        else:
            print("No information found or error occurred.")
