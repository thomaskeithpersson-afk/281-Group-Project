# 📚 BookExchange

BookExchange is a web-based textbook marketplace designed specifically for university students to buy and sell used textbooks directly with one another on campus.

This project was developed as part of a university group assignment and demonstrates structured documentation, organized repository management, and front-end application development.

---

# 📘 Course Information

**Course:** COURSE CODE (e.g., ENSE 281 – Software Systems Engineering)  
**Instructor:** INSTRUCTOR NAME  
**Institution:** University of Regina  
**Project Type:** Group Project  

**Team Members:**
- FULL NAME (Student ID)
- FULL NAME (Student ID)
- FULL NAME (Student ID)

**Submission Version:** v1.0  
**Date:** INSERT DATE

---

# 🚩 Problem Statement

University textbooks typically cost between $100–$300 per book, resulting in an annual expense exceeding $1,200 for many students.

Campus bookstore buyback programs usually return only 10–20% of the original price. As a result:

- Students lose significant money on resale.
- Books remain unused after courses end.
- Incoming students purchase the same books at full price.
- There is no campus-specific platform connecting student buyers and sellers directly.

---

# 💡 Proposed Solution

BookExchange provides a simple and user-friendly platform where students can:

- Post textbooks for sale
- Browse available listings
- Search by course code or book title
- View detailed book information
- Contact sellers directly
- Mark listings as sold
- Delete listings

The system keeps money within the student community while encouraging textbook reuse.

---

# 🛠 Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage (Browser-based storage)
- Git & GitHub (Version control)

This is a front-end prototype application. No backend or database is used. All data is stored locally in the browser for demonstration purposes.

---

# 📂 Repository Structure

281-GROUP-PROJECT/
│
├── app/
│ ├── index.html
│ ├── browse.html
│ ├── post.html
│ ├── details.html
│ ├── style.css
│ └── script.js
│
├── docs/
│ ├── business-case/
│ │ ├── BookExchange_BusinessCase.pdf
│ │ └── BookExchange_BusinessCase.docx
│ │
│ ├── project-charter/
│ │ ├── BookExchange_ProjectCharter.pdf
│ │ └── BookExchange_ProjectCharter.docx
│ │
│ └── pitch/
│ ├── BookExchange_PitchDeck.pdf
│ └── BookExchange_PitchDeck.pptx
│
├── assets/
│ └── screenshots/
│
├── README.md
└── .gitignore





This structure ensures that:
- All required deliverables are clearly organized.
- Source formats and PDF versions are included.
- Application files are separated from documentation.
- The repository remains clean and user-friendly.

---

# 🚀 How to Run the Application

1. Clone the repository:

git clone <repository-url>


2. Open the project folder in VS Code.

3. Navigate to the `app/` directory.

4. Open `index.html`.

5. Run using:
- Live Server extension (recommended), or
- Open directly in a web browser.

No installation or backend setup is required.

---

# 🧪 Core Features

- Post a book listing
- Browse available listings
- Search by course code or book title
- View full book details
- Mark listings as sold
- Delete listings
- Form validation for required fields
- Status management (available / sold)

---

# 🔄 User Flow

### Seller Posts a Book
1. Navigate to "Post a Book"
2. Fill out book details
3. Submit form
4. Listing appears on Browse page

### Buyer Finds a Book
1. Navigate to Browse
2. Search by course code or title
3. Click "View Details"
4. Contact seller

### Transaction Completion
1. Buyer and seller meet
2. Seller marks listing as sold
3. Listing is removed from active listings

---

# 🔐 Privacy & Safety Considerations

This prototype displays seller contact information directly for demonstration purposes.

In a real-world deployment, improvements would include:

- User authentication system
- In-app messaging instead of public email display
- Masked contact relay
- User rating system
- Safety guidelines for in-person exchanges
- Secure backend database

These considerations were identified during peer feedback and are acknowledged as important future enhancements.

---

# 📈 Future Improvements

- Backend integration (Node.js / Firebase)
- Cloud database storage
- Authentication & user accounts
- Messaging system
- Advanced search filters
- UI/UX enhancements
- Mobile-first optimization

---

# 📎 Deliverables

All required academic deliverables are included in the `docs/` directory:

- Business Case (PDF + DOCX)
- Project Charter (PDF + DOCX)
- Pitch Presentation (PDF + PPTX)

Each document includes required course information, team details, and structured formatting.

---

# 📷 Screenshots

(Add screenshots inside `assets/screenshots/` and reference them below.)

Example:


---

# 📌 Project Status

This is a functional front-end prototype developed for academic evaluation.

The repository has been structured to meet submission requirements and improve clarity, documentation quality, and professional presentation.

---

# 🏁 Conclusion

BookExchange demonstrates:

- Problem analysis and solution design
- Structured documentation
- Organized GitHub repository management
- Front-end development implementation
- Consideration of privacy and safety implications

The project provides a clear foundation for future expansion into a production-ready campus marketplace system.
