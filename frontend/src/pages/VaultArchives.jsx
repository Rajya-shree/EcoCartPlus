// import React, { useState, useEffect } from "react";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  History,
  ExternalLink,
  Search,
} from "lucide-react";
// import { ChevronLeft, Trash2, History, Search } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { toast } from "react-toastify";
import "./VaultArchives.css";

const VaultArchives = () => {
  const [archives, setArchives] = useState([]);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchFullVault = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/conversations/vault`,
        config,
      );
      setArchives(data);
    } catch (err) {
      toast.error("Failed to sync archives");
    }
  };

  useEffect(() => {
    fetchFullVault();
  }, []);

  const deleteSession = async (id, e) => {
    e.stopPropagation(); // Prevents navigating to the chat when clicking delete
    if (!window.confirm("Purge this technical node from the database?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/conversations/vault/${id}`, config);
      toast.success("Node deleted");
      setArchives(archives.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const clearAllArchives = async () => {
    if (
      !window.confirm(
        "CRITICAL ACTION: This will permanently delete your entire technical history. Proceed?",
      )
    )
      return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // 🟢 Calls the new DELETE ALL route
      await axios.delete(`${BASE_URL}/conversations/vault/all`, config);

      toast.success("Archives fully purged");
      setArchives([]); // Clear local state immediately
    } catch (err) {
      toast.error("Mass purge failed");
    }
  };

  const filteredAndSorted = useMemo(() => {
    return archives
      .filter((session) =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [archives, searchTerm, sortOrder]);

  return (
    <div className="archives-page-container animate-in">
      {/* <header className="archives-top-bar">
        <button onClick={() => navigate("/dashboard")} className="back-to-hub">
          <ChevronLeft size={18} /> BACK TO COMMAND HUB
        </button>
        <h1>Technical Vault Archives</h1>
        <p>Full historical record of diagnostic synchronization nodes.</p>
      </header> */}
      <header className="archives-top-bar">
        <div className="archives-controls">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            <History size={16} />{" "}
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button> */}
          <button
            className="sort-toggle-btn"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            <History size={16} />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="back-to-hub"
            >
              <ChevronLeft size={18} /> BACK TO COMMAND HUB
            </button>
            <h1>Technical Vault Archives</h1>
          </div>

          {/* 🟢 NEW PURGE BUTTON */}
          {archives.length > 0 && (
            <button className="purge-all-btn" onClick={clearAllArchives}>
              <Trash2 size={16} /> PURGE ALL NODES
            </button>
          )}
        </div>
        <p>Full historical record of diagnostic synchronization nodes.</p>
      </header>

      {/* <div className="archives-list">
        {archives.map((session) => (
          <div
            key={session._id}
            className="archive-entry-card"
            onClick={() => navigate(`/diagnosis?id=${session._id}`)}
          >
            <div className="entry-main">
              <History className="text-emerald" size={20} />
              <div className="entry-details">
                <h3>{session.title}</h3>
                <span className="entry-date">
                  {new Date(session.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="entry-actions">
              <button
                className="archive-del-btn"
                onClick={(e) => deleteSession(session._id, e)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div> */}
      <div className="archives-list">
        {/* 🟢 FIXED: Mapping over filteredAndSorted instead of archives */}
        {filteredAndSorted.map((session) => (
          <div
            key={session._id}
            className="archive-entry-card"
            onClick={() => navigate(`/diagnosis?id=${session._id}`)}
          >
            <div className="entry-main">
              <History className="text-emerald" size={20} />
              <div className="entry-details">
                <h3>{session.title}</h3>
                <span className="entry-date">
                  {new Date(session.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="entry-actions">
              <button
                className="archive-del-btn"
                onClick={(e) => deleteSession(session._id, e)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State for Search */}
        {filteredAndSorted.length === 0 && archives.length > 0 && (
          <div className="no-results">No nodes match "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};

export default VaultArchives;
