import xml.etree.ElementTree as ET


def createXMLelement(root, add):

    # create the doc element
    doc = ET.SubElement(root, "doc")

    # add id field
    id_field = ET.SubElement(doc, "field", name="id")
    id_field.text = "12345"+add  # replace with identifier value

    # add date field
    date_field = ET.SubElement(doc, "field", name="date")
    date_field.text = "2023-05-09"  # replace with datestamp value

    # add title field
    title_field = ET.SubElement(doc, "field", name="title")
    title_field.text = "Example Title"  # replace with dc:title value

    # add author field
    author_field = ET.SubElement(doc, "field", name="author")
    author_field.text = "John Doe"  # replace with dc:creator value

    # add subject fields
    subject1_field = ET.SubElement(doc, "field", name="subject")
    subject1_field.text = "Example Subject 1"  # replace with dc:subject value
    subject2_field = ET.SubElement(doc, "field", name="subject")
    subject2_field.text = "Example Subject 2"  # replace with dc:subject value

    # add text field
    text_field = ET.SubElement(doc, "field", name="text")
    text_field.text = "Example Description"  # replace with dc:description value

    # add link field
    link_field = ET.SubElement(doc, "field", name="link")
    link_field.text = "http://example.com"  # replace with dc:identifier value

    # add language field
    language_field = ET.SubElement(doc, "field", name="language")
    language_field.text = "en"  # replace with dc:language value




def main():
    # create the root element
    root = ET.Element("add")

    for i in range (2):
        createXMLelement(root, str(i))

    # create the XML tree
    tree = ET.ElementTree(root)
    xml_string = ET.tostring(root, encoding='UTF-8')
    formatted_string = xml_string.decode().replace('><', '>\n<')

    # write the formatted XML string to a file
    with open("test.xml", "w") as f:
        f.write(formatted_string)

if __name__ == "__main__":
    main()