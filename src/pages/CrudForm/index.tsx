import { ClassicEditor } from "@/components/Base/Ckeditor";
import React, { useState, useEffect } from "react";
import Button from "@/components/Base/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
}

function Main() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState(["1"]);
  const [groups, setGroups] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { contactId, contact } = location.state ?? {};

  const [companyId, setCompanyId] = useState("");
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroup, setNewGroup] = useState("");

  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [filteredEmployeeList, setFilteredEmployeeList] = useState<Employee[]>(
    []
  );

  const [phoneOptions, setPhoneOptions] = useState<number[]>([]);
  const [phoneNames, setPhoneNames] = useState<{ [key: number]: string }>({});

  const [imageFile, setImageFile] = useState<File | null>(null);
  const baseUrl = "https://juta-dev.ngrok.dev";

  // Get current user email for comparison
  const getCurrentUserEmail = () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return userData.email;
      }
    } catch (e) {
      console.error("Error parsing userData from localStorage");
    }
    return null;
  };

  const fetchGroups = async () => {
    if (!companyId) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/company-groups?companyId=${companyId}`
      );
      if (!response.ok) throw new Error("Failed to fetch groups");

      const groupsArray = await response.json();
      setGroups(groupsArray);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    // Use user info from localStorage (set during API login)
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const email = userData.email;
        if (email) {
          (async () => {
            try {
              const response = await fetch(
                `${baseUrl}/api/user-page-context?email=${email}`
              );
              if (!response.ok) throw new Error("Failed to fetch user context");
              const data = await response.json();
              setCompanyId(data.companyId);
              setCurrentUserRole(data.role);
              // Process employee list
              const employeeListData: Employee[] = data.employees.map(
                (employee: any) => ({
                  id: employee.id,
                  name: employee.name,
                  email: employee.email || employee.id,
                  role: employee.role,
                  employeeId: employee.employeeId,
                  phoneNumber: employee.phoneNumber,
                })
              );
              setEmployeeList(employeeListData);
              // Set phone index data
              setPhoneNames(data.phoneNames);
              console.error("Phone Names:", data.phoneNames);
              setPhoneOptions(Object.keys(data.phoneNames).map(Number));
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          })();
        }
      } catch (e) {
        console.error("Invalid userData in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchGroups();
    }
  }, [companyId]);

  const [userData, setUserData] = useState<{
    name: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: string;
    companyId: string;
    group: string;
    employeeId: string;
    notes: string;
    quotaLeads: number;
    invoiceNumber: string | null;
    phone: number;
    phone2?: number;
    phone3?: number;
    imageUrl: string;
    weightage: number;
    weightage2?: number;
    weightage3?: number;
    viewEmployees: string[];
    viewEmployee: string | null;
    phoneAccess?: { [key: number]: boolean };
    phoneWeightages?: { [key: number]: number };
  }>({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "",
    companyId: "",
    group: "",
    employeeId: "",
    notes: "",
    quotaLeads: 0,
    invoiceNumber: null,
    phone: 0,
    imageUrl: "",
    weightage: 0,
    viewEmployees: [],
    viewEmployee: null,
    phoneAccess: {},
    phoneWeightages: {},
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (contact && contact.id) {
        try {
          const response = await fetch(
            `${baseUrl}/api/user-page-details?id=${contact.id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const userDetails = await response.json();

          // Parse phone access and weightages from database format
          // phone_access is an object like {"0":true, "1":false, "2":true}
          const phoneAccessObj = userDetails.phone_access || {};
          // weightages is an object like {"0": 10, "1": 0, "2": 5}
          const weightagesObj = userDetails.weightages || {};

          // Convert string keys to number keys for consistency
          const phoneAccess: { [key: number]: boolean } = {};
          const phoneWeightages: { [key: number]: number } = {};
          
          Object.entries(phoneAccessObj).forEach(([key, value]) => {
            if (value === true) {
              phoneAccess[Number(key)] = true;
              phoneWeightages[Number(key)] = weightagesObj[key] || 0;
            }
          });

          // Get the first phone that has access (for primary phone field)
          const firstActivePhone = Object.entries(phoneAccessObj)
            .find(([_, v]) => v === true)?.[0];
          
          // Get all phones with access for additional phone fields
          const activePhones = Object.entries(phoneAccessObj)
            .filter(([_, v]) => v === true)
            .map(([k]) => Number(k));

          // Parse viewEmployees array from database
          const viewEmployeesArray = Array.isArray(userDetails.viewEmployees) ? userDetails.viewEmployees : [];

          setUserData({
            name: userDetails.name || "",
            phoneNumber: userDetails.phoneNumber || "",
            email: userDetails.email || "",
            password: "", // Don't populate password for security
            role: userDetails.role || "",
            companyId: userDetails.companyId || companyId,
            group: userDetails.group || "",
            employeeId: userDetails.employeeId || "",
            notes: userDetails.notes || "",
            quotaLeads: userDetails.quotaLeads || 0,
            invoiceNumber: userDetails.invoiceNumber || null,
            phone: firstActivePhone ? Number(firstActivePhone) : 0,
            phone2: activePhones.length > 1 ? activePhones[1] : undefined,
            phone3: activePhones.length > 2 ? activePhones[2] : undefined,
            imageUrl: userDetails.imageUrl || "",
            weightage: firstActivePhone ? (weightagesObj[firstActivePhone] || 0) : 0,
            weightage2: activePhones.length > 1 ? (weightagesObj[String(activePhones[1])] || 0) : undefined,
            weightage3: activePhones.length > 2 ? (weightagesObj[String(activePhones[2])] || 0) : undefined,
            viewEmployees: viewEmployeesArray,
            viewEmployee: null,
            phoneAccess: phoneAccess,
            phoneWeightages: phoneWeightages,
          });

          // Set selectedEmployees to match the loaded viewEmployees data
          setSelectedEmployees(viewEmployeesArray);

          // Note: Don't filter the employee list here since it depends on role hierarchy
          // The filtering will be handled by the useEffect that depends on currentUserRole and employeeList
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to load user details");
        }
      }
    };

    fetchUserData();
    fetchGroups();
  }, [contact, companyId, employeeList]);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setUserData((prev) => {
      const newData = { ...prev, [name]: value };

      // Reset phone to -1 if role is not "2" (Sales)
      if (name === "role" && value !== "2") {
        newData.phone = 0;
      }

      return newData;
    });
  };

  const handlePhoneToggle = (phoneIndex: number, isEnabled: boolean) => {
    setUserData((prev) => {
      const newPhoneAccess = { ...prev.phoneAccess };
      const newPhoneWeightages = { ...prev.phoneWeightages };
      
      if (isEnabled) {
        newPhoneAccess[phoneIndex] = true;
        // Set default weightage if not already set
        if (!newPhoneWeightages[phoneIndex]) {
          newPhoneWeightages[phoneIndex] = 0;
        }
      } else {
        delete newPhoneAccess[phoneIndex];
        delete newPhoneWeightages[phoneIndex];
      }
      
      return {
        ...prev,
        phoneAccess: newPhoneAccess,
        phoneWeightages: newPhoneWeightages,
      };
    });
  };

  const handleWeightageChange = (phoneIndex: number, weightage: number) => {
    setUserData((prev) => ({
      ...prev,
      phoneWeightages: {
        ...prev.phoneWeightages,
        [phoneIndex]: weightage,
      },
    }));
  };

  const handleAddNewGroup = () => {
    setIsAddingNewGroup(true);
  };

  const handleCancelNewGroup = () => {
    setIsAddingNewGroup(false);
    setNewGroup("");
  };

  const handleSaveNewGroup = () => {
    if (newGroup.trim()) {
      setGroups((prev) => [...prev, newGroup.trim()]);
      setUserData((prev) => ({ ...prev, group: newGroup.trim() }));
      setIsAddingNewGroup(false);
      setNewGroup("");
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleEditorChange = (data: string) => {
    setUserData((prev) => ({ ...prev, notes: data }));
  };

  const isFieldDisabled = (fieldName: string) => {
    if (currentUserRole === "1") return false; // Admin (role 1) can edit everything
    if (currentUserRole === "3") return fieldName !== "password"; // Observer can only edit password
    if (fieldName === "role") return false; // Allow role changes for non-admin users
    return userData.role === "3"; // For other roles, they can't edit users with role 3
  };

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const requiredFields = ["name", "phoneNumber", "email", "role"];

    // Only require password for new users
    if (!contactId) {
      requiredFields.push("password");
    }

    requiredFields.forEach((field) => {
      if (!userData[field as keyof typeof userData]) {
        errors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Password validation
    if (userData.password && userData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(`${baseUrl}/api/upload-media`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleEmployeeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Get all selected options (can be empty if user deselects all)
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedEmployees(selectedOptions);

    // Update both viewEmployees (array) and viewEmployee (used by Chat component)
    setUserData((prev) => ({
      ...prev,
      viewEmployees: selectedOptions,
      // If no employees are selected, set viewEmployee to null
      // Otherwise use the first selected employee
      // This ensures both fields are consistent for the Chat component
      viewEmployee: selectedOptions.length > 0 ? selectedOptions[0] : null,
    }));
  };

  const saveUser = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const userOri = userData;
      if (!userOri || !userOri.email) {
        setErrorMessage("No authenticated user found. Please log in again.");
        return;
      }

      // Check if the user is updating their own profile
      const currentUserEmail = getCurrentUserEmail();
      const isUpdatingSelf = currentUserEmail === userData.email;

      let imageUrl = userData.imageUrl;
      if (imageFile) {
        try {
          imageUrl = (await uploadImage()) || "";
        } catch (error: any) {
          setErrorMessage(`Failed to upload image: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      if (currentUserRole !== "3" || isUpdatingSelf) {
        // Format phone number for API
        const formatPhoneNumber = (phoneNumber: string) => {
          return phoneNumber && !phoneNumber.startsWith("+")
            ? "+6" + phoneNumber
            : phoneNumber;
        };

        const userDataToSend = {
          name: userData.name,
          phoneNumber: formatPhoneNumber(userData.phoneNumber),
          email: userData.email,
          role: userData.role,
          companyId: companyId,
          group: userData.group,
          employeeId: userData.employeeId || null,
          notes: userData.notes || null,
          quotaLeads: userData.quotaLeads || 0,
          invoiceNumber: userData.invoiceNumber || null,
          phone: userData.phone ?? 0,
          weightage: Number(userData.weightage) || 0,
          imageUrl: imageUrl || "",
          viewEmployees: userData.viewEmployees || [],
          viewEmployee: userData.viewEmployee || null,
        };

        if (contactId) {
          // Build phone access and weightages objects for update using new structure
          const phoneAccessObj: { [key: string]: boolean } = {};
          const weightagesObj: { [key: string]: number } = {};

          // Use the new phoneAccess and phoneWeightages structure
          if (userData.phoneAccess) {
            Object.entries(userData.phoneAccess).forEach(([phoneIndex, isEnabled]) => {
              if (isEnabled) {
                phoneAccessObj[phoneIndex] = true;
                weightagesObj[phoneIndex] = userData.phoneWeightages?.[Number(phoneIndex)] || 0;
              }
            });
          }

          // Update user via API
          const updateData = {
            contactId: contact.id, // Use the email as contactId
            name: userData.name,
            phoneNumber: formatPhoneNumber(userData.phoneNumber),
            email: userData.email,
            password: userData.password || undefined, // Only send if provided
            role: userData.role,
            companyId: companyId,
            group: userData.group,
            employeeId: userData.employeeId || null,
            notes: userData.notes || null,
            quotaLeads: userData.quotaLeads || 0,
            invoiceNumber: userData.invoiceNumber || null,
            phone: userData.phone ?? 0,
            weightage: Number(userData.weightage) || 0,
            imageUrl: imageUrl || "",
            viewEmployees: userData.viewEmployees || [],
            viewEmployee: userData.viewEmployee || null,
            phoneAccess: phoneAccessObj,
            weightages: weightagesObj
          };

          const response = await fetch(`${baseUrl}/api/update-user`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user");
          }
          toast.success("User updated successfully");
        } else {
          // Add user via API
          const phoneAccessObj: { [key: string]: boolean } = {};
          const weightagesObj: { [key: string]: number } = {};

          // Use the new phoneAccess and phoneWeightages structure
          if (userData.phoneAccess) {
            Object.entries(userData.phoneAccess).forEach(([phoneIndex, isEnabled]) => {
              if (isEnabled) {
                phoneAccessObj[phoneIndex] = true;
                weightagesObj[phoneIndex] = userData.phoneWeightages?.[Number(phoneIndex)] || 0;
              }
            });
          }

          const requestBody = {
            name: userData.name,
            employeeId: userData.employeeId || undefined,
            phoneAccess: Object.keys(phoneAccessObj).length > 0 ? phoneAccessObj : undefined,
            weightages: Object.keys(weightagesObj).length > 0 ? weightagesObj : undefined,
            company: undefined, // Add if needed
            imageUrl: imageUrl || undefined,
            notes: userData.notes || undefined,
            quotaLeads: userData.quotaLeads || undefined,
            viewEmployees: userData.viewEmployees?.length > 0 ? userData.viewEmployees : undefined,
            invoiceNumber: userData.invoiceNumber || undefined,
            empGroup: userData.group || undefined,
            profile: undefined, // Add if needed
            threadId: undefined // Add if needed
          };

          const response = await fetch(
            `${baseUrl}/api/add-user/${encodeURIComponent(companyId)}/${encodeURIComponent(userData.email)}/${encodeURIComponent(formatPhoneNumber(userData.phoneNumber))}/${encodeURIComponent(userData.password)}/${encodeURIComponent(userData.role)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }
          toast.success("User created successfully");
        }
        setSuccessMessage(
          contactId ? "User updated successfully" : "User created successfully"
        );
      }

      setErrorMessage("");
      setIsLoading(false);
      navigate("/users-layout-2");
    } catch (error: any) {
      setErrorMessage(error.message || "Error saving user");
      setIsLoading(false);
    }
  };

  const editorConfig = {
    toolbar: {
      items: [
        "bold",
        "italic",
        "link",
        "bulletedList",
        "numberedList",
        "blockQuote",
        "insertTable",
        "undo",
        "redo",
        "heading",
        "alignment",
        "fontColor",
        "fontSize",
      ],
    },
  };

  const [editorData, setEditorData] = useState("<p>Content of the editor.</p>");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filter employees based on role hierarchy
    const filterEmployeesByRole = () => {
      if (!currentUserRole || !employeeList) return;

      const roleHierarchy: { [key: string]: number } = {
        "1": 5, // Admin - highest level
        "4": 4, // Manager
        "5": 3, // Supervisor
        "2": 2, // Sales
        "3": 1, // Observer - lowest level
      };

      const currentRoleLevel = roleHierarchy[currentUserRole];

      const filtered = employeeList.filter((employee) => {
        const employeeRoleLevel = roleHierarchy[employee.role];
        return employeeRoleLevel < currentRoleLevel;
      });

      setFilteredEmployeeList(filtered);
    };

    filterEmployeesByRole();
  }, [currentUserRole, employeeList]);

  return (
    <div className="w-full px-4 py-6 h-full flex flex-col bg-slate-50 dark:bg-darkmode-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline-secondary"
            className="shadow-md"
            onClick={() => navigate(-1)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {contactId ? "Update User" : "Add User"}
          </h2>
        </div>
      </div>
      <div className="bg-white/70 dark:bg-darkmode-800/70 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-darkmode-700/30 p-6 flex-grow overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <FormLabel htmlFor="name" className="text-slate-700 dark:text-slate-300">Name *</FormLabel>
              <FormInput
                id="name"
                name="name"
                type="text"
                value={userData.name}
                onChange={handleChange}
                placeholder="Name"
                disabled={isFieldDisabled("name")}
                required
                className="bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm border border-white/30 dark:border-darkmode-600/30 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:border-transparent"
              />
              {fieldErrors.name && (
                <p className="text-danger text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>
            
            <div>
              <FormLabel htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">Phone Number *</FormLabel>
              <div className="flex">
                <FormInput
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+60123456789"
                  className="flex-grow bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm border border-white/30 dark:border-darkmode-600/30 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:border-transparent"
                  disabled={isFieldDisabled("phoneNumber")}
                  required
                />
              </div>
              {fieldErrors.phoneNumber && (
                <p className="text-danger text-sm mt-1">
                  {fieldErrors.phoneNumber}
                </p>
              )}
            </div>
            
            <div>
              <FormLabel htmlFor="email" className="text-slate-700 dark:text-slate-300">Email *</FormLabel>
              <FormInput
                id="email"
                name="email"
                type="text"
                value={userData.email}
                onChange={handleChange}
                placeholder="Email"
                disabled={isFieldDisabled("email")}
                required
                className="bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm border border-white/30 dark:border-darkmode-600/30 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:border-transparent"
              />
              {fieldErrors.email && (
                <p className="text-danger text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div>
              <FormLabel htmlFor="role" className="text-slate-700 dark:text-slate-300">Role *</FormLabel>
              <select
                id="role"
                name="role"
                value={userData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  if (currentUserRole !== "1" && newRole === "1") {
                    // Prevent non-admin users from selecting admin role
                    toast.error(
                      "You don't have permission to assign admin role."
                    );
                    return;
                  }
                  handleChange(e);
                  setCategories([newRole]);
                }}
                className="text-slate-700 dark:text-white border-slate-300 dark:border-darkmode-600 bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-darkmode-700/80 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 rounded-lg text-sm w-full p-2.5"
                disabled={isFieldDisabled("role")}
                required
              >
                <option value="">Select role</option>
                {currentUserRole === "1" && <option value="1">Admin</option>}
                {currentUserRole === "1" && <option value="4">Manager</option>}
                {currentUserRole === "1" && <option value="5">Supervisor</option>}
                {currentUserRole === "4" && <option value="4">Manager</option>}
                {currentUserRole === "5" && <option value="5">Supervisor</option>}
                <option value="2">Sales</option>
                <option value="3">Observer</option>
              </select>
              {fieldErrors.role && (
                <p className="text-danger text-sm mt-1">{fieldErrors.role}</p>
              )}
            </div>
            
            <div>
              <FormLabel htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Password {contactId ? "(Leave blank to keep current)" : "*"}
              </FormLabel>
              <FormInput
                id="password"
                name="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                placeholder={contactId ? "New password (optional)" : "Password"}
                disabled={isFieldDisabled("password")}
                required={!contactId}
                className="bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm border border-white/30 dark:border-darkmode-600/30 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:border-transparent"
              />
              {fieldErrors.password && (
                <p className="text-danger text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <FormLabel htmlFor="group" className="text-slate-700 dark:text-slate-300">Group</FormLabel>
              {isAddingNewGroup ? (
                <div className="flex items-center">
                  <FormInput
                    type="text"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    placeholder="Enter new group name"
                    className="w-full mr-2 bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm border border-white/30 dark:border-darkmode-600/30 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:border-transparent"
                    disabled={isFieldDisabled("group")}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="mr-2"
                    onClick={handleCancelNewGroup}
                    disabled={isFieldDisabled("group")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveNewGroup}
                    disabled={isFieldDisabled("group")}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <select
                    id="group"
                    name="group"
                    value={userData.group}
                    onChange={handleChange}
                    className="text-slate-700 dark:text-white border-slate-300 dark:border-darkmode-600 bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-darkmode-700/80 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 rounded-lg text-sm w-full mr-2 p-2.5"
                    disabled={isFieldDisabled("group")}
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setIsAddingNewGroup(true)}
                    disabled={isFieldDisabled("group")}
                  >
                    + Add New Group
                  </Button>
                </div>
              )}
            </div>
            
            {(currentUserRole === "1" || currentUserRole === "4" || currentUserRole === "5") && (
              <div>
                <FormLabel htmlFor="viewEmployees" className="text-slate-700 dark:text-slate-300">
                  View Employee's Chats
                </FormLabel>
                <select
                  id="viewEmployees"
                  name="viewEmployees"
                  multiple
                  value={selectedEmployees}
                  onChange={handleEmployeeSelection}
                  className="text-slate-700 dark:text-white border-slate-300 dark:border-darkmode-600 bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-darkmode-700/80 focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 rounded-lg text-sm w-full p-2.5"
                  size={5}
                >
                  {filteredEmployeeList.map((employee) => (
                    <option key={employee.id} value={employee.email}>
                      {employee.name} -{" "}
                      {employee.role === "2"
                        ? "Sales"
                        : employee.role === "3"
                        ? "Observer"
                        : employee.role === "4"
                        ? "Manager"
                        : employee.role === "5"
                        ? "Supervisor"
                        : "Admin"}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Hold Ctrl/Cmd to select multiple employees or deselect all employees
                </p>
              </div>
            )}
            
            <div>
              <FormLabel htmlFor="phoneAccess" className="text-slate-700 dark:text-slate-300">Phone Access</FormLabel>
              <div className="space-y-3 p-4 border border-white/30 dark:border-darkmode-600/30 rounded-lg bg-white/40 dark:bg-darkmode-700/40 backdrop-blur-sm">
                {Object.entries(phoneNames).length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No phones available</p>
                ) : (
                  Object.entries(phoneNames).map(([index, phoneName]) => {
                    const phoneIndex = parseInt(index);
                    const isEnabled = userData.phoneAccess?.[phoneIndex] || false;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`phone-${index}`}
                            checked={isEnabled}
                            onChange={(e) => handlePhoneToggle(phoneIndex, e.target.checked)}
                            disabled={
                              isFieldDisabled("phone") ||
                              (currentUserRole !== "1" && userData.role !== "2")
                            }
                            className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                          />
                          <label 
                            htmlFor={`phone-${index}`}
                            className="text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            {phoneName || `Phone ${phoneIndex}`}
                          </label>
                        </div>
                        {isEnabled && (
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-slate-600 dark:text-slate-400">
                              Weightage:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={userData.phoneWeightages?.[phoneIndex] || 0}
                              onChange={(e) => handleWeightageChange(phoneIndex, parseInt(e.target.value) || 0)}
                              disabled={
                                isFieldDisabled("phone") ||
                                (currentUserRole !== "1" && userData.role !== "2")
                              }
                              className="w-20 px-2 py-1 text-xs border border-slate-300 dark:border-darkmode-600 rounded bg-white/60 dark:bg-darkmode-700/60 text-slate-900 dark:text-slate-100"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div>
              <FormLabel htmlFor="image" className="text-slate-700 dark:text-slate-300">Profile Image</FormLabel>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-slate-300 dark:border-darkmode-600 rounded-md bg-white/60 dark:bg-darkmode-700/60 backdrop-blur-sm"
              />
              {userData.imageUrl && (
                <img
                  src={userData.imageUrl}
                  alt="Profile"
                  className="mt-2 w-32 h-32 object-cover rounded-full"
                />
              )}
            </div>
          </div>
        </div>
        {errorMessage && (
          <div
            className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg relative mt-4 backdrop-blur-sm"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 mt-4">{successMessage}</div>
        )}
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline-secondary"
          className="px-6 py-2 shadow-md bg-white/70 dark:bg-darkmode-800/70 hover:bg-white/90 dark:hover:bg-darkmode-800/90 border border-slate-200/50 dark:border-darkmode-600/50 backdrop-blur-sm transition-all duration-200"
          onClick={handleGoBack}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          className="px-6 py-2 shadow-md bg-primary/90 hover:bg-primary border border-primary/30 backdrop-blur-sm transition-all duration-200"
          onClick={saveUser}
          disabled={
            isLoading || (currentUserRole === "3" && !userData.password)
          }
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Main;