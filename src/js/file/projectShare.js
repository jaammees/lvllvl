// NOT USED???

var ProjectShare = function() {
  this.editor = null;

  this.shareDialog = null;
  this.githubClient = null;
  
}

ProjectShare.prototype = {
  init: function(githubClient) {
    this.githubClient = githubClient;
    this.github = g_app.github;
  },

  initShareDialogContent: function() {
    this.checkRepository();
  },

  initShareDialogEvents: function() {
    var _this = this;
    $('#loginRegisterGitHub').on('click', function() {
      _this.githubClient.login(function() {
        _this.userIsLoggedIn();
      });
    });

  },

  showShareDialog: function() {
    var _this = this;
    console.log("SHOW SHARE DIALOG!!!");

    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

    if(this.shareDialog == null) {
      var width = 320;
      var height = 296;
      this.shareDialog = UI.create("UI.Dialog", { "id": "projectShareDialog", "title": "Share Project", "width": width, "height": height });

      this.shareHTML = UI.create("UI.HTMLPanel");
      this.shareDialog.add(this.shareHTML);
      this.shareHTML.load('html/project/projectShareDialog.html', function() {    
        _this.initShareDialogEvents();
        _this.initShareDialogContent();
      });


      this.shareDialog.on('close', function() {
        console.log("CLOSE SHARE DIALOG");
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);

      }); 


      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        UI.closeDialog();
      });
 
      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.shareDialog.addButton(okButton);
      this.shareDialog.addButton(closeButton);
      UI.showDialog("projectShareDialog");
    } else {
      UI.showDialog("projectShareDialog");
      this.initShareDialogContent();      
    }

  },

  checkRepository: function() {
    // need to check if logged in...
    if(!this.githubClient.isLoggedIn()) {
      $('#projectShareLogin').show();
    } else {
      this.userIsLoggedIn();
    }
  },

  userIsLoggedIn: function() {
    $('#projectShareLogin').hide();
    $('#projectShareRepositoryDetails').show();

    // is the current repository a public one?
    var args = this.github.getCurrentRepository();
    console.log('current repository');
    console.log(args);

    if(args.repository == '') {
      this.noCurrentRepository();
    } else {
      var _this = this;

      this.githubClient.getRepoDetails(args, function(response) {
        console.log("GET REPO DETAILS RESPONSE::::");

        console.log(response);

        var private = response.data.private;
        if(private) {
          _this.currentRepositoryIsPrivate(args);
        } else {
          _this.currentRepositoryIsPublic(args);
        }
      });
    }
  },

  noCurrentRepository: function(args) {
    $('#projectShareRepositoryDetails').show();
    $('#projectShareRepositoryOptions').hide();
    $('#projectShareNewRepository').show();
    var owner = this.githubClient.getLoginName();

    $('#shareRepositoryOwner').val(owner);

    $('#shareRepositoryName').val('Repository');
    $('#shareRepositoryName').select();
    $('#shareRepositoryName').focus();
  },

  currentRepositoryIsPublic: function(args) {

    $('#projectShareRepositoryDetails').show();
    $('#projectShareRepositoryOptions').show();
    $('#projectShareNewRepository').hide();

    $('#shareRepositoryOwner').val(args.owner);
    $('#shareRepositoryName').val(args.repository);
    $('#shareGithubRepositoryAction_save').prop('checked', true);
    
  },

  currentRepositoryIsPrivate: function() {

  },


  createRepository: function() {
    var args = {};
    args.owner = $('#shareRepositoryOwner').val().trim();
    args.repository = $('#shareRepositoryName').val().trim().replace(/ /g, "-");
    args.repositoryType = "public";
    args.commitMessage = "Initial Commit";

    if(args.owner == '') {
      alert('Please enter a value for the repository owner')
      return;
    }

    if(args.repository == '') {
      alert('Please enter a name for the repository')
      return;
    }

    
  },



}
