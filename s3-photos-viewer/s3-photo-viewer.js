// **DO THIS**:
//   Replace BUCKET_NAME with the bucket name.
//
var albumBucketName = 'birds-family-album';

// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'eu-central-1'; // Region
var accessKeyId = process.env.AWS_ACCESS_KEY;
var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
AWS.config.credentials = new AWS.Credentials(accessKeyId, secretAccessKey, null);

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}

// List the photo albums that exist in the bucket.
function listAlbums() {
  s3.listObjects({Delimiter: '.jpeg'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<li>',
            '<button style="margin:5px;" onclick="viewAlbum(\'' + albumName + '\')">',
              albumName,
            '</button>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>',
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate = [
        '<h2>Albums</h2>',
        message,
        '<ul>',
          getHtml(albums),
        '</ul>',
      ]
      document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    }
  });
}


function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + photoKey;
      var params = {
        Bucket: albumBucketName,
        Key: photoKey
       };
       s3.getObject(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else  {
            var src = URL.createObjectURL(new Blob([data.Body], { type: 'image/png' } /* (1) */));
            var photo = getHtml([
              '<span>',
                '<div>',
                  '<br/>',
                  '<img style="width:128px;height:128px;" src="' + src + '"/>',
                '</div>',
                '<div>',
                  '<span>',
                    photoKey.replace(albumPhotosKey, ''),
                  '</span>',
                '</div>',
              '</span>',
            ]);

            document.getElementById('viewer').innerHTML += photo;
          }
       });

      return
    });
    // var message = photos.length ?
    //   '<p>The following photos are present.</p>' :
    //   '<p>There are no photos in this album.</p>';
    // var htmlTemplate = [
    //   '<div>',
    //     '<button onclick="listAlbums()">',
    //       'Back To Albums',
    //     '</button>',
    //   '</div>',
    //   '<h2>',
    //     'Album: ' + albumName,
    //   '</h2>',
    //   message,
    //   '<div>',
    //     getHtml(photos),
    //   '</div>',
    //   '<h2>',
    //     'End of Album: ' + albumName,
    //   '</h2>',
    //   '<div>',
    //     '<button onclick="listAlbums()">',
    //       'Back To Albums',
    //     '</button>',
    //   '</div>',
    // ]
    // .innerHTML = getHtml(htmlTemplate);
    // document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
  });
}