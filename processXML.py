import xml.etree.ElementTree as ET
from dataclasses import dataclass


class Record:
    """
    This is a struct to store information for each xml record
    """
    id: str = "id"
    date: int = 0
    title: str = ""
    author: str = ""
    subject: list = ""
    text: str = ""
    link: str = ""
    language: str = ""

    def __init__(self, id: str, date: int, title: str, author: str, subject: list, text: str, link: str, language: str):
        self.id = id
        self.date = date
        self.title = title
        self.author = author
        self.subject = subject
        self.text = text
        self.link = link
        self.language = language

    def __init__(self):
        id: str = "id"
        date: int = 0
        title: str = "Title"
        author: str = ""
        subject: list = ["subject_1", "subject_2"]
        text: str = "lorem ipsum"
        link: str = "www.google.com"
        language: str = "english"

    def toString(self):
        print("id:", self.id)
        print("date:", self.date)
        print("title:", self.title)
        print("author:", self.author)
        print("subjects:", self.subject)
        print("text:", self.text)
        print("link:", self.link)
        print("language:", self.language)
        print("_"*100)


def createXMLelement(root, record):
    """
    Method used to process the information stored in the Record struct into a heirarchical XML entry.
    """

    # create the doc element
    doc = ET.SubElement(root, "doc")

    # add id field
    id_field = ET.SubElement(doc, "field", name="id")
    id_field.text = record.id  # replace with identifier value

    # add date field
    date_field = ET.SubElement(doc, "field", name="date")
    date_field.text = record.date  # replace with datestamp value

    # add title field
    title_field = ET.SubElement(doc, "field", name="title")
    title_field.text = record.title  # replace with dc:title value

    # add author field
    author_field = ET.SubElement(doc, "field", name="author")
    author_field.text = record.author  # replace with dc:creator value

    # add subject fields (needs to be changed to a loop, so that as many subjects as necessary can be added)
    arr = record.subject.strip(" ").split('| ')
    for e in arr:
        e = e.strip('|')
        subject_field = ET.SubElement(doc, "field", name="subject")
        subject_field.text = e  # replace with dc:subject value

    # add text field
    text_field = ET.SubElement(doc, "field", name="text")
    text_field.text = record.text  # replace with dc:description value

    # add link field
    link_field = ET.SubElement(doc, "field", name="link")
    link_field.text = record.link  # replace with dc:identifier value

    # add language field
    language_field = ET.SubElement(doc, "field", name="language")
    language_field.text = record.language  # replace with dc:language value


def find_tag(filename):
    """
    Method which reads an entire XML file, and finds individual records, extracts desired tags,
    and puts the information into a struct. Still need to fix issue with identifier 
    """
    tree = ET.parse(filename)
    root = tree.getroot()
    count = 0
    records = []

    def search(node, records, count):
        for child in node:
            search(child, records, count)
        if node.tag:
            if '}' in node.tag:
                tag = node.tag.split('}')[1]
            else:
                tag = node.tag

            if (tag == "identifier"):
                records[count].id = node.text
            elif (tag == "datestamp"):
                records[count].date = node.text
            elif (tag == "title"):
                records[count].title = node.text
            elif (tag == "creator"):
                records[count].author += node.text
            elif (tag == "subject"):
                records[count].subject += (node.text + " | ")
            elif (tag == "description"):
                records[count].text = node.text
            elif (tag == "language"):
                records[count].language = node.text
            if (tag == "identifier" and records[count].id != "id"):
                records[count].link = node.text

            # Some print debugging
            # print(tag, ":", node.text)

    def searchForRecord(node, records, count):
        for child in node:
            if child.tag == "record":
                records.append(Record())
                search(child, records, count)
                count += 1  # count of records found so far, used to keep position in array

    searchForRecord(root, records, count)

    # Some more print debugging
    # for record in records:
    #     record.toString()
    return records


def main():
    records = find_tag("raw.xml")
    # create the root element
    root = ET.Element("add")

    for record in records:
        createXMLelement(root, record)

    # create the XML tree
    tree = ET.ElementTree(root)
    xml_string = ET.tostring(root, encoding='UTF-8')
    formatted_string = xml_string.decode().replace('><', '>\n<')

    # write the formatted XML string to a file
    with open("processed.xml", "w") as f:
        f.write(formatted_string)

    # Use this to verify all documents parsed
    print(len(records))


if __name__ == "__main__":
    main()
