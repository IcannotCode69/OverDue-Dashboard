// OverDue Dashboard Routes Configuration
import DashboardPage from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import NotesPage from "./pages/Notes";
import AssistantPage from "./pages/Assistant";
import GradesPage from "./pages/Grades";
import ProfilePage from "./pages/Profile";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import { 
  IoHome,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoChatbubbleEllipsesOutline,
  IoSchoolOutline,
  IoPersonOutline,
  IoLogInOutline,
  IoPersonAddOutline
} from "react-icons/io5";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <IoHome size="15px" color="inherit" />,
    component: DashboardPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Calendar",
    key: "calendar",
    route: "/calendar",
    icon: <IoCalendarOutline size="15px" color="inherit" />,
    component: CalendarPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Notes",
    key: "notes",
    route: "/notes",
    icon: <IoDocumentTextOutline size="15px" color="inherit" />,
    component: NotesPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "AI Assistant",
    key: "assistant",
    route: "/assistant",
    icon: <IoChatbubbleEllipsesOutline size="15px" color="inherit" />,
    component: AssistantPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Grades",
    key: "grades",
    route: "/grades",
    icon: <IoSchoolOutline size="15px" color="inherit" />,
    component: GradesPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <IoPersonOutline size="15px" color="inherit" />,
    component: ProfilePage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "signin",
    route: "/signin",
    icon: <IoLogInOutline size="15px" color="inherit" />,
    component: SignInPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "signup",
    route: "/signup",
    icon: <IoPersonAddOutline size="15px" color="inherit" />,
    component: SignUpPage,
    noCollapse: true,
  },
];

export default routes;
