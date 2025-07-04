import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Collapse,
} from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './custom-editor.css';
import { Checkbox } from '@mui/material';
import { ExpandLess, ExpandMore, Folder, Movie, Article, PictureAsPdf, PictureInPicture } from '@mui/icons-material';

const drawerWidth = 300;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#cba6f7', // Mauve
    },
    secondary: {
      main: '#f5c2e7', // Pink
    },
    background: {
      default: '#1e1e2e', // Base
      paper: '#181825', // Mantle
    },
    text: {
      primary: '#cdd6f4', // Text
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
  },
});

function App() {
  const [coursePath, setCoursePath] = useState('');
  const [courseStructure, setCourseStructure] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState({});
  const [completed, setCompleted] = useState({});
  const [timestamps, setTimestamps] = useState({});
  const [htmlContent, setHtmlContent] = useState('');
  const [notes, setNotes] = useState({});
  const videoRef = useRef(null);

  const fetchCourseStructure = useCallback(async (path, lastSelectedItemPath) => {
    const findNodeByPath = (nodes, path, parent = null) => {
      for (const node of nodes) {
        if (node.path === path) {
          return { node, parent };
        }
        if (node.children) {
          const found = findNodeByPath(node.children, path, node);
          if (found.node) {
            return found;
          }
        }
      }
      return { node: null, parent: null };
    };
    try {
      const data = await window.electron.getCourseStructure(path);
      if (!data.error) {
        setCourseStructure(data);
        if (lastSelectedItemPath) {
          const { node, parent } = findNodeByPath(data, lastSelectedItemPath);
          if (node) {
            setSelectedItem(node);
          }
          if (parent) {
            setOpen((prevOpen) => ({ ...prevOpen, [parent.name]: true }));
          }
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching course structure:', error);
    }
  }, []);

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    setCompleted(savedProgress.completed || {});
    setTimestamps(savedProgress.timestamps || {});
    setNotes(savedProgress.notes || {});
    if (savedProgress.lastPath) {
      setCoursePath(savedProgress.lastPath);
      fetchCourseStructure(savedProgress.lastPath, savedProgress.lastSelectedItem);
    }
  }, [fetchCourseStructure]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && selectedItem && selectedItem.name.endsWith('.mp4')) {
        const newTimestamps = { ...timestamps, [selectedItem.path]: videoRef.current.currentTime };
        setTimestamps(newTimestamps);
        localStorage.setItem('courseProgress', JSON.stringify({ ...JSON.parse(localStorage.getItem('courseProgress') || '{}'), timestamps: newTimestamps }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedItem, timestamps]);

  const handleFolderOpen = async () => {
    const path = await window.electron.openFolderDialog();
    if (path) {
      setCoursePath(path);
      fetchCourseStructure(path);
      localStorage.setItem('courseProgress', JSON.stringify({ ...JSON.parse(localStorage.getItem('courseProgress') || '{}'), lastPath: path }));
    }
  };



  const handleItemClick = async (item) => {
    setSelectedItem(item);
    localStorage.setItem('courseProgress', JSON.stringify({ ...JSON.parse(localStorage.getItem('courseProgress') || '{}'), lastSelectedItem: item.path }));
    if (item.name.endsWith('.html')) {
      const data = await window.electron.getResource(item.path);
      if (!data.error) {
        const text = new TextDecoder().decode(data);
        setHtmlContent(text);
      }
    }
  };

  const handleToggle = (name) => {
    setOpen((prevOpen) => ({ ...prevOpen, [name]: !prevOpen[name] }));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration - videoRef.current.currentTime <= 10) {
      handleCompletionChange(selectedItem.path, true);
    }
  };

  const handleLoadedMetadata = () => {
    if (selectedItem && selectedItem.name.endsWith('.mp4') && videoRef.current) {
      const savedTime = timestamps[selectedItem.path];
      if (savedTime) {
        videoRef.current.currentTime = savedTime;
      }
    }
  };

  const handleCompletionChange = (path, isCompleted) => {
    const newCompleted = { ...completed, [path]: isCompleted };
    setCompleted(newCompleted);
    localStorage.setItem('courseProgress', JSON.stringify({ ...JSON.parse(localStorage.getItem('courseProgress') || '{}'), completed: newCompleted }));
  };

  const handleNoteChange = (content) => {
    const newNotes = { ...notes, [selectedItem.path]: content };
    setNotes(newNotes);
    localStorage.setItem('courseProgress', JSON.stringify({ ...JSON.parse(localStorage.getItem('courseProgress') || '{}'), notes: newNotes }));
  };

  const handlePipClick = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const renderTree = (nodes) => (
    <List dense>
      {nodes.map((node) => {
        if (node.type === 'directory') {
          return (
            <React.Fragment key={node.name}>
              <ListItemButton onClick={() => handleToggle(node.name)}>
                <ListItemIcon>
                  <Folder />
                </ListItemIcon>
                <ListItemText primary={node.name} />
                {open[node.name] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open[node.name]} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4 }}>{renderTree(node.children)}</Box>
              </Collapse>
            </React.Fragment>
          );
        } else {
          const isCompleted = completed[node.path] || false;
          return (
            <ListItem key={node.name} disablePadding>
              <Checkbox
                edge="start"
                checked={isCompleted}
                tabIndex={-1}
                disableRipple
                onChange={(e) => handleCompletionChange(node.path, e.target.checked)}
              />
              <ListItemButton onClick={() => handleItemClick(node)} selected={selectedItem?.path === node.path}>
                <ListItemIcon>
                  {node.name.endsWith('.mp4') ? <Movie /> : node.name.endsWith('.pdf') ? <PictureAsPdf /> : <Article />}
                </ListItemIcon>
                <ListItemText primary={node.name} />
              </ListItemButton>
            </ListItem>
          );
        }
      })}
    </List>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ p: 2 }}>
            <Button variant="contained" onClick={handleFolderOpen} fullWidth>
              Open Course Folder
            </Button>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {coursePath}
            </Typography>
          </Box>
          {renderTree(courseStructure)}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          {selectedItem && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                {selectedItem.name.endsWith('.mp4') && (
                  <>
                    <video
                      ref={videoRef}
                    key={selectedItem.path}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    controls
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    <source src={selectedItem.path} type="video/mp4" />
                    {selectedItem.subtitles && selectedItem.subtitles.map((subtitle, index) => (
                      <track
                        key={index}
                        kind="subtitles"
                        src={subtitle.src}
                        srcLang={subtitle.srclang}
                        label={subtitle.label}
                      />
                    ))}
                      Your browser does not support the video tag.
                    </video>
                    <IconButton onClick={handlePipClick} sx={{ mt: 1 }}>
                      <PictureInPicture />
                    </IconButton>
                  </>
                )}
                {selectedItem.name.endsWith('.html') && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      p: 2,
                      overflowY: 'auto',
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )}
                {selectedItem.name.endsWith('.pdf') && (
                  <iframe src={selectedItem.path} style={{ width: '100%', height: '100%', border: 0 }} title={selectedItem.name} />
                )}
              </Box>
              {selectedItem && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Notes</Typography>
                  <CKEditor
                    editor={ClassicEditor}
                    data={notes[selectedItem.path] || ''}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      handleNoteChange(data);
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
