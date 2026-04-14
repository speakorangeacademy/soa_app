# CSS Refactoring Guide - Before/After Examples

## 🔄 Refactoring Strategy Overview

This guide provides concrete examples of how to refactor the most common styling issues found in the SOA codebase.

---

## Example 1: Flex Column Pattern (Common in 60+ places)

### ❌ BEFORE - Inline Style Repetition
```tsx
// components/teacher/batch-card.tsx:49
<div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
        {batch.course_name}
    </h3>
    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem' }}>
        {batch.name}
    </p>
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        // Content
    </div>
</div>
```

### ✅ AFTER - CSS Classes + Tailwind

**1. Add to globals.css:**
```css
/* Flexbox Utilities */
.flex-col { 
  display: flex; 
  flex-direction: column; 
}

.flex-between { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
}

/* Text Styles */
.heading-3 { 
  font-size: 1.125rem; 
  color: var(--color-primary); 
  margin-bottom: 0.25rem; 
}

.text-subtitle { 
  font-weight: 600; 
  color: var(--color-text); 
  font-size: 0.9375rem; 
}

.text-muted-small { 
  font-size: 0.8125rem; 
  color: var(--color-text-muted); 
}
```

**2. Update component:**
```tsx
// components/teacher/batch-card.tsx:49
<div className="flex-between mb-4">
    <div>
        <h3 className="heading-3">{batch.course_name}</h3>
        <p className="text-subtitle">{batch.name}</p>
    </div>
</div>

<div className="grid grid-cols-2 gap-4 mb-6">
    <div className="flex items-center gap-2 text-muted-small">
        {/* Content */}
    </div>
</div>
```

---

## Example 2: Icon Input Positioning (Found in 40+ places)

### ❌ BEFORE - Repeated Absolute Positioning
```tsx
// components/super-admin/create-admin-form.tsx:102, 117, 133, 148
<div style={{ position: 'relative' }}>
    <User size={18} 
        style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--color-text-muted)' 
        }} 
    />
    <Input 
        {...register('name')}
        style={{ paddingLeft: '40px' }}
        placeholder="Enter name"
    />
</div>
```

### ✅ AFTER - CSS Class + Component

**1. Create CSS class in globals.css:**
```css
.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-left: 2.5rem; /* 40px */
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
  line-height: 1;
}
```

**2. Create reusable component:**
```tsx
// components/ui/InputWithIcon.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputWithIconProps {
  icon: LucideIcon;
  placeholder?: string;
  [key: string]: any;
}

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, placeholder, ...props }, ref) => (
    <div className="input-with-icon">
      <Icon className="input-icon" size={18} />
      <input 
        ref={ref}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
);
```

**3. Use in component:**
```tsx
// components/super-admin/create-admin-form.tsx
<InputWithIcon
  icon={User}
  placeholder="Full Name"
  {...register('name')}
/>
```

---

## Example 3: Table Header Styling (35+ duplicate styles)

### ❌ BEFORE - Repeated inline styles on every header
```tsx
// components/teacher/student-table.tsx:78-88
<thead style={{ backgroundColor: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Student Name
        </th>
        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Parent Name
        </th>
        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Contact Info
        </th>
    </tr>
</thead>

<tbody>
    {students.map(student => (
        <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: '1rem' }}>
                <span style={{ fontWeight: 600 }}>{student.name}</span>
            </td>
            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{student.parent_name}</td>
        </tr>
    ))}
</tbody>
```

### ✅ AFTER - CSS classes for table styling

**1. Add to globals.css:**
```css
/* Table Styling */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table thead {
  background-color: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border);
}

.data-table tr {
  border-bottom: 1px solid var(--color-border);
}

.data-table td {
  padding: 1rem;
  font-size: 0.875rem;
}

.data-table tbody tr:hover {
  background-color: rgba(255, 140, 66, 0.02);
}
```

**2. Update component:**
```tsx
// components/teacher/student-table.tsx
<div className="table-wrapper">
    <table className="data-table">
        <thead>
            <tr>
                <th>Student Name</th>
                <th>Parent Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {students.map(student => (
                <tr key={student.id}>
                    <td>
                        <span className="font-semibold">{student.name}</span>
                    </td>
                    <td>{student.parent_name}</td>
                    {/* Rest of cells */}
                </tr>
            ))}
        </tbody>
    </table>
</div>
```

---

## Example 4: Form Input Styling (Repeated in register, reset-password, etc.)

### ❌ BEFORE - Hardcoded colors + repeated styles
```tsx
// app/register/page.tsx:160-174
<label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>
    Student Full Name
</label>
<Input
    {...register('student_name')}
    style={{
        border: isError ? '1.5px solid #E53935' : '1.5px solid #F0E4D7',
        background: '#fff',
        color: '#2C2416',
        minHeight: '44px',
    }}
/>
{errors.student_name && (
    <p style={{ color: '#E53935', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        {errors.student_name.message}
    </p>
)}
```

### ✅ AFTER - CSS classes using design system

**1. Add to globals.css:**
```css
/* Form Elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.form-input {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  min-height: 44px;
  transition: var(--transition-fast);
  font-family: 'Work Sans', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
}

.form-input.error {
  border-color: var(--color-danger);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

.form-error {
  color: var(--color-danger);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-error-message {
  display: flex;
  gap: 0.5rem;
  background-color: rgba(229, 57, 53, 0.05);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

**2. Update component:**
```tsx
// app/register/page.tsx
<div className="form-group">
    <label className="form-label">Student Full Name</label>
    <input
        {...register('student_name')}
        className={`form-input ${errors.student_name ? 'error' : ''}`}
        placeholder="Enter student name"
    />
    {errors.student_name && (
        <p className="form-error">{errors.student_name.message}</p>
    )}
</div>
```

---

## Example 5: Button Styling with Hover States

### ❌ BEFORE - Inline JavaScript hover handlers
```tsx
// app/register/page.tsx:350-351
<button
    onClick={handleSubmit}
    style={{
        background: '#FF8C42',
        color: '#fff',
        padding: '14px 32px',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: '0.2s'
    }}
    onMouseEnter={(e) => {
        if (!loading) {
            e.currentTarget.style.background = '#D94E1F';
            e.currentTarget.style.transform = 'translateY(-1px)';
        }
    }}
    onMouseLeave={(e) => {
        if (!loading) {
            e.currentTarget.style.background = '#FF8C42';
            e.currentTarget.style.transform = 'translateY(0)';
        }
    }}
    disabled={loading}
>
    {loading ? 'Processing...' : 'Register'}
</button>
```

### ✅ AFTER - CSS classes with proper states

**1. Add to globals.css:**
```css
/* Button Styles */
.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**2. Update component:**
```tsx
// app/register/page.tsx
<button
    type="button"
    onClick={handleSubmit}
    className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
    disabled={loading}
>
    {loading ? 'Processing...' : 'Register'}
</button>
```

---

## Example 6: Replace Hardcoded Colors

### ❌ BEFORE - Scattered hardcoded colors
```tsx
// app/page.tsx:77-98
<button style={{
    padding: '14px 32px',
    background: '#FF8C42',  // ← Hardcoded
    color: '#fff',          // ← Hardcoded
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600
}}
onMouseEnter={e => { e.currentTarget.style.background = '#D94E1F'; }}
onMouseLeave={e => { e.currentTarget.style.background = '#FF8C42'; }}
>
    Get Started
</button>

<button style={{
    padding: '14px 32px',
    background: '#fff',           // ← Hardcoded
    color: '#2C2416',             // ← Hardcoded
    border: '2px solid #F0E4D7',  // ← Hardcoded
    borderRadius: '12px',
}}
onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF8C42')}
onMouseLeave={e => (e.currentTarget.style.borderColor = '#F0E4D7')}
>
    Learn More
</button>
```

### ✅ AFTER - Using CSS variables

**Add to globals.css:**
```css
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  padding: 14px 32px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-secondary:hover {
  border-color: var(--color-primary);
}
```

**Update component:**
```tsx
// app/page.tsx
<button className="btn-primary">Get Started</button>
<button className="btn-secondary">Learn More</button>
```

---

## 🎯 Refactoring Checklist

When refactoring a component:

### 1. Extract Style Objects
- [ ] Identify all `style={{...}}` instances
- [ ] Check if they repeat in the same file
- [ ] Check if similar patterns exist in other files

### 2. Check for Hardcoded Colors
- [ ] Replace hex colors with CSS variables
- [ ] Look for design system matches
- [ ] Update email templates and PDF components

### 3. Create CSS Classes
- [ ] Name classes using BEM or utility-first approach
- [ ] Add to globals.css or component stylesheet
- [ ] Test across all breakpoints

### 4. Replace with Tailwind or Classes
- [ ] Convert layout styles to Tailwind classes
- [ ] Use CSS classes for complex styling
- [ ] Remove inline style objects

### 5. Test Responsiveness
- [ ] Check mobile view (< 640px)
- [ ] Check tablet view (640px - 1024px)
- [ ] Check desktop view (> 1024px)

---

## 📚 Resources

- **Design System**: [app/globals.css](app/globals.css)
- **Full Analysis**: [STYLING_ANALYSIS.md](STYLING_ANALYSIS.md)
- **Quick Reference**: [STYLING_QUICK_REFERENCE.md](STYLING_QUICK_REFERENCE.md)

---

## Next Steps

1. Start with **Example 2 (Icon Inputs)** - Easy to extract, used 40+ times
2. Then **Example 3 (Tables)** - High impact, used in multiple components
3. Then **Example 1 (Flex Layouts)** - Foundation for layout consistency
4. Then **Example 4 (Forms)** - Consolidate all form styling
5. Finally **Example 6 (Colors)** - System-wide refactor

