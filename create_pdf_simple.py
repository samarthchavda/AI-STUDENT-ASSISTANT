#!/usr/bin/env python3
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.colors import HexColor
import re

# Read markdown
with open('Full_Stack_Developer_Interview_Guide.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Create PDF
pdf_file = 'Full_Stack_Developer_Interview_Guide.pdf'
doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                       rightMargin=0.75*inch, leftMargin=0.75*inch,
                       topMargin=0.75*inch, bottomMargin=0.75*inch)

elements = []
styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'],
    fontSize=22, textColor=HexColor('#2c3e50'), spaceAfter=20, spaceBefore=10, leading=28)

h1_style = ParagraphStyle('CustomH1', parent=styles['Heading1'],
    fontSize=16, textColor=HexColor('#2c3e50'), spaceAfter=10, spaceBefore=15, leading=20)

h2_style = ParagraphStyle('CustomH2', parent=styles['Heading2'],
    fontSize=13, textColor=HexColor('#34495e'), spaceAfter=8, spaceBefore=12, leading=16)

h3_style = ParagraphStyle('CustomH3', parent=styles['Heading3'],
    fontSize=11, textColor=HexColor('#7f8c8d'), spaceAfter=6, spaceBefore=10, leading=14)

normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'],
    fontSize=10, leading=14)

# Process markdown
is_first_h1 = True
for line in lines:
    line = line.rstrip()
    
    if not line:
        elements.append(Spacer(1, 0.1*inch))
        continue
    
    # Escape XML special characters
    line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # Convert markdown bold to reportlab
    line = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', line)
    
    if line.startswith('# ') and not line.startswith('## '):
        text = line[2:].strip()
        if is_first_h1:
            elements.append(Paragraph(text, title_style))
            is_first_h1 = False
        else:
            elements.append(PageBreak())
            elements.append(Paragraph(text, h1_style))
    elif line.startswith('## '):
        text = line[3:].strip()
        elements.append(Spacer(1, 0.15*inch))
        elements.append(Paragraph(text, h1_style))
    elif line.startswith('### '):
        text = line[4:].strip()
        elements.append(Paragraph(text, h2_style))
    elif line.startswith('#### '):
        text = line[5:].strip()
        elements.append(Paragraph(text, h3_style))
    elif line.startswith('---'):
        elements.append(Spacer(1, 0.15*inch))
    elif line.startswith('- ') or line.startswith('* '):
        text = '• ' + line[2:].strip()
        elements.append(Paragraph(text, normal_style))
    elif line.strip() and line[0].isdigit() and '. ' in line[:4]:
        elements.append(Paragraph(line, normal_style))
    else:
        if line.strip():
            elements.append(Paragraph(line, normal_style))

# Build PDF
print("Generating PDF...")
doc.build(elements)
print(f"✅ PDF created successfully!")
print(f"📄 File: {pdf_file}")

import os
size = os.path.getsize(pdf_file)
print(f"📊 Size: {size:,} bytes ({size/1024:.1f} KB)")
print(f"📍 Location: {os.path.abspath(pdf_file)}")
